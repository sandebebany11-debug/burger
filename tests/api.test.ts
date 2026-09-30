// Integration tests for the reservation API against the file store.
//   npm test
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, test } from "node:test";

const dir = mkdtempSync(path.join(tmpdir(), "cd-test-"));
process.env.RESERVATION_STORE = "file";
process.env.RESERVATION_STORE_DIR = dir;
process.env.ADMIN_PASSWORD = "test-password";
delete process.env.RESEND_API_KEY;

const { handle } = await import("../server/api.ts");
const { addDays, berlinNow, weekdayOf, DEFAULT_SETTINGS } = await import("../shared/reservations.ts");
const { store } = await import("../server/store.ts");

const call = async (method: string, url: string, body?: unknown, token?: string) => {
  const res = await handle(
    new Request(`http://localhost${url}`, {
      method,
      headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
  return { status: res.status, body: (await res.json()) as any };
};

/** next open weekday (Mon–Sat) at least `min` days ahead */
function openDay(min = 2): string {
  let d = addDays(berlinNow().date, min);
  while (weekdayOf(d) === 0) d = addDays(d, 1);
  return d;
}

const guest = (over: object = {}) => ({
  date: openDay(),
  time: "19:00",
  guests: 2,
  name: "Maria Rossi",
  phone: "+49 170 1234567",
  email: "maria@example.com",
  message: "",
  occasion: "",
  consent: true,
  ...over,
});

let token = "";
before(async () => {
  const r = await call("POST", "/api/admin/login", { password: "test-password" });
  token = r.body.token;
});
after(() => rmSync(dir, { recursive: true, force: true }));

describe("availability", () => {
  test("month lists every day, Sundays closed by default", async () => {
    const month = openDay(3).slice(0, 7);
    const r = await call("GET", `/api/availability?month=${month}`);
    assert.equal(r.status, 200);
    const days = Object.entries(r.body.days) as [string, string][];
    assert.ok(days.length >= 28);
    for (const [d, state] of days) if (weekdayOf(d) === 0) assert.equal(state, "closed");
    assert.equal(r.body.maxPartySize, DEFAULT_SETTINGS.maxPartySize);
  });

  test("day returns slots without exposing seat counts", async () => {
    const r = await call("GET", `/api/availability?date=${openDay()}`);
    assert.equal(r.status, 200);
    assert.ok(r.body.slots.length > 0);
    assert.equal(r.body.slots[0].remaining, undefined);
  });

  test("past dates have no slots", async () => {
    const r = await call("GET", `/api/availability?date=${addDays(berlinNow().date, -3)}`);
    assert.equal(r.body.state, "closed");
    assert.equal(r.body.slots.length, 0);
  });

  test("rejects malformed input", async () => {
    assert.equal((await call("GET", "/api/availability?month=2026-13-01")).status, 400);
    assert.equal((await call("GET", "/api/availability?date=2026-02-30")).status, 400);
  });
});

describe("reservations", () => {
  test("creates a pending request", async () => {
    const r = await call("POST", "/api/reservations", guest());
    assert.equal(r.status, 201);
    assert.equal(r.body.status, "pending");
  });

  test("validates fields with friendly messages", async () => {
    const r = await call("POST", "/api/reservations", guest({ email: "nope", phone: "", consent: false, guests: 0 }));
    assert.equal(r.status, 422);
    assert.ok(r.body.fields.email);
    assert.ok(r.body.fields.phone);
    assert.ok(r.body.fields.consent);
    assert.ok(r.body.fields.guests);
  });

  test("rejects parties above the online limit", async () => {
    const r = await call("POST", "/api/reservations", guest({ guests: DEFAULT_SETTINGS.maxPartySize + 1, time: "18:00" }));
    assert.equal(r.status, 422);
    assert.match(r.body.fields.guests, /rufen Sie uns/);
  });

  test("blocks duplicate requests for the same slot and e-mail", async () => {
    const r = await call("POST", "/api/reservations", guest());
    assert.equal(r.status, 409);
    assert.equal(r.body.error, "duplicate");
  });

  test("enforces slot capacity", async () => {
    const date = openDay(5);
    const cap = DEFAULT_SETTINGS.capacityPerSlot;
    let booked = 0;
    let i = 0;
    while (booked + 10 <= cap) {
      const r = await call("POST", "/api/reservations", guest({ date, time: "20:00", guests: 10, email: `g${i++}@example.com` }));
      assert.equal(r.status, 201);
      booked += 10;
    }
    const over = await call("POST", "/api/reservations", guest({ date, time: "20:00", guests: cap - booked + 1, email: "late@example.com" }));
    assert.equal(over.status, 409);
    assert.equal(over.body.error, "slot_full");
  });

  test("unknown slot times are refused", async () => {
    const r = await call("POST", "/api/reservations", guest({ time: "03:15", email: "night@example.com" }));
    assert.equal(r.status, 409);
    assert.equal(r.body.error, "slot_unavailable");
  });

  test("honeypot submissions are silently dropped", async () => {
    const before = (await store().list("r/")).length;
    const r = await call("POST", "/api/reservations", { ...guest({ email: "bot@example.com" }), website: "http://spam" });
    assert.equal(r.status, 201);
    assert.equal((await store().list("r/")).length, before);
  });
});

describe("admin", () => {
  test("wrong password is refused", async () => {
    const r = await call("POST", "/api/admin/login", { password: "wrong" });
    assert.equal(r.status, 401);
  });

  test("protected routes need a valid token", async () => {
    assert.equal((await call("GET", "/api/admin/reservations")).status, 401);
    assert.equal((await call("GET", "/api/admin/reservations", undefined, "123.abc")).status, 401);
  });

  test("lists, confirms and deletes reservations", async () => {
    const list = await call("GET", `/api/admin/reservations?from=${berlinNow().date}&to=${addDays(berlinNow().date, 30)}`, undefined, token);
    assert.equal(list.status, 200);
    const mine = list.body.reservations.find((r: any) => r.email === "maria@example.com");
    assert.ok(mine);

    const confirmed = await call("PATCH", `/api/admin/reservations/${mine.id}`, { status: "confirmed" }, token);
    assert.equal(confirmed.body.reservation.status, "confirmed");

    const bad = await call("PATCH", `/api/admin/reservations/${mine.id}`, { status: "maybe" }, token);
    assert.equal(bad.status, 400);

    const declined = await call("PATCH", `/api/admin/reservations/${mine.id}`, { status: "declined" }, token);
    assert.equal(declined.body.reservation.status, "declined");
    // declined requests free their seats → the guest may ask again
    const again = await call("POST", "/api/reservations", guest());
    assert.equal(again.status, 201);

    const del = await call("DELETE", `/api/admin/reservations/${mine.id}`, undefined, token);
    assert.equal(del.status, 200);
  });

  test("blocking a slot removes it from public availability", async () => {
    const date = openDay(9);
    await call("PUT", "/api/admin/blocks", { date, times: ["19:30"] }, token);
    const day = await call("GET", `/api/availability?date=${date}`);
    assert.equal(day.body.slots.find((s: any) => s.time === "19:30").state, "blocked");
    const r = await call("POST", "/api/reservations", guest({ date, time: "19:30", email: "b@example.com" }));
    assert.equal(r.status, 409);

    await call("PUT", "/api/admin/blocks", { date, times: ["*"] }, token);
    assert.equal((await call("GET", `/api/availability?date=${date}`)).body.state, "closed");
  });

  test("settings are validated and applied", async () => {
    const current = (await call("GET", "/api/admin/settings", undefined, token)).body.settings;
    assert.equal((await call("PUT", "/api/admin/settings", { ...current, capacityPerSlot: 0 }, token)).status, 400);
    const open = { ...current, weekdays: { ...current.weekdays, 0: { open: true, slots: ["12:00", "13:00"] } } };
    assert.equal((await call("PUT", "/api/admin/settings", open, token)).status, 200);
    let sunday = addDays(berlinNow().date, 2);
    while (weekdayOf(sunday) !== 0) sunday = addDays(sunday, 1);
    const day = await call("GET", `/api/availability?date=${sunday}`);
    assert.deepEqual(day.body.slots.map((s: any) => s.time), ["12:00", "13:00"]);
  });

  test("expired reservations are purged (Löschkonzept)", async () => {
    const old = addDays(berlinNow().date, -(DEFAULT_SETTINGS.retentionDays + 2));
    const id = `${old.replaceAll("-", "")}-aaaaaaaaaaaa`;
    await store().set(`r/${old}/${id}`, { id, date: old, time: "19:00", guests: 2, status: "completed" });
    const r = await call("GET", "/api/admin/reservations", undefined, token);
    assert.ok(r.body.purged >= 1);
    assert.equal(await store().get(`r/${old}/${id}`), null);
  });
});
