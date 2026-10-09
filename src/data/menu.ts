/**
 * Rialto's menu, transcribed 1:1 from the printed menu (dish numbers, names,
 * descriptions and prices). Only obvious typos were corrected
 * (e.g. "Chrispy" → "Crispy", "Carbonara"). Allergen / additive codes are
 * omitted because the printed legend was not available — see README.
 *
 * Do not add dishes, ingredients or prices that are not on the printed menu.
 */

export interface MenuItem {
  no: string;
  name: string;
  desc?: string;
  /** One price, or one per entry in the category's `priceLabels`. */
  prices: number[];
  /** Extra info shown next to the price, e.g. "10 St." or "0,33 l". */
  unit?: string;
}

export interface MenuSection {
  title?: string;
  note?: string;
  items: MenuItem[];
}

export interface MenuCategory {
  id: string;
  title: string;
  /** Short line under the category title. */
  note?: string;
  /** Column labels for multi-price categories (pizza sizes, salad sizes). */
  priceLabels?: string[];
  sections: MenuSection[];
}

const i = (no: string, name: string, desc: string | undefined, prices: number[], extra: Partial<MenuItem> = {}): MenuItem => ({
  no,
  name,
  desc,
  prices,
  ...extra,
});

const P3 = (a: number, b: number, c: number) => [a, b, c];

export const menu: MenuCategory[] = [
  {
    id: "pizza",
    title: "Pizza",
    note: "Alle Pizzen mit Tomatensauce, Käse & Oregano",
    priceLabels: ["24 cm", "28 cm", "32 cm"],
    sections: [
      {
        items: [
          i("01", "Margherita", "Tomatensauce & Käse", P3(7.0, 8.5, 10.0)),
          i("02", "Salami", "mit Salami", P3(7.5, 9.5, 11.5)),
          i("03", "Prosciutto", "mit Formvorderschinken", P3(7.5, 9.5, 11.5)),
          i("04", "Siciliana", "mit Sardellen, Oliven & Thunfisch", P3(9.0, 10.5, 12.5)),
          i("05", "Tonno", "mit Thunfisch", P3(9.0, 10.0, 12.5)),
          i("06", "Capricciosa", "mit Formvorderschinken & fr. Champignons", P3(9.0, 10.5, 12.5)),
          i("07", "Hawaii", "mit Formvorderschinken & Ananas", P3(9.0, 10.5, 12.5)),
          i("08", "Funghi", "mit fr. Champignons", P3(9.5, 10.5, 12.9)),
          i("09", "Broccoli", "mit Broccoli & Mais", P3(9.5, 10.5, 12.9)),
          i("09a", "Pizza Döner", "mit Dönerfleisch, Zwiebeln (Tzatziki extra)", P3(9.0, 10.5, 11.9)),
          i("09b", "Selvi", "mit Broccoli, Mais, Sauce Hollandaise – anstatt Tomatensauce", P3(8.5, 9.5, 12.5)),
          i("10", "Quattro Stagioni", "mit Thunfisch, Champignons, Spiegelei, Paprika", P3(9.5, 10.5, 12.5)),
          i("11", "Lina", "mit Salami, Formvorderschinken & Ananas", P3(9.5, 10.5, 12.5)),
          i("12", "Diavolo", "fr. Champignons, Formvorderschinken, Paprika, Peperoni, Weichkäse", P3(9.5, 11.5, 13.0)),
          i("12a", "Kentucky", "ohne Tomatensauce, mit Sauce Hollandaise, Broccoli & Hähnchenbrust", P3(9.5, 11.5, 13.0)),
          i("13", "Greek", "mit Weichkäse, Tomaten, Zwiebeln, milde Peperoni", P3(9.5, 10.5, 12.9)),
          i("14", "Spezial", "Formvorderschinken, Salami, fr. Champignons, Dönerfleisch", P3(9.5, 10.5, 12.9)),
          i("15", "Bosporus", "mit Dönerfleisch, Paprika, Thunfisch", P3(9.5, 10.5, 12.9)),
          i("16", "Döner Quick", "Tomatensauce, Dönerfleisch, Zwiebeln, Sauce Hollandaise", P3(9.5, 10.5, 12.9)),
          i("16a", "Spinaci", "mit Spinat & Knoblauch", P3(8.0, 9.0, 10.5)),
          i("17", "Vegetaria", "fr. Champignons, Broccoli, Spinat, Zwiebeln & Knoblauch", P3(7.5, 9.5, 11.5)),
          i("17a", "Döner Pizza", "zugeklappt, Dönerfleisch, Röstzwiebeln, Hamburgersauce", P3(9.5, 10.5, 12.9)),
          i("18", "Italia", "mit Thunfisch & fr. Champignons", P3(9.5, 10.5, 12.9)),
          i("19", "Frutti di Mare", "mit Meeresfrüchten, Thunfisch & Sardellen", P3(9.5, 10.5, 12.9)),
          i("20", "Quattro Formaggi", "mit Gorgonzola, Weichkäse, Mozzarella, Goudakäse", P3(9.5, 10.5, 12.9)),
          i("21", "Bolognese", "mit Bolognesesauce & Käse", P3(9.0, 10.0, 11.0)),
          i("22", "Phantasia", "mit 3 Belägen nach Wahl", P3(9.5, 10.5, 12.9)),
          i("23", "Calzone Uno", "mit fr. Champignons, Salami, Formvorderschinken", P3(9.5, 10.5, 12.9)),
          i("24", "Calzone Due", "mit Thunfisch, fr. Champignons, Paprika, Spinat", P3(9.5, 10.5, 12.9)),
          i("25", "Rustica", "Salami, Formvorderschinken, Thunfisch, Knoblauch, Zwiebeln, Champignons", P3(9.5, 10.5, 12.9)),
          i("25a", "Pizza Rialto", "mit Salami, Paprika, Mais & Jalapeños", P3(9.5, 10.5, 12.9)),
          i("25b", "Venezia", "mit Parmaschinken & Mozzarella", P3(9.5, 10.5, 12.9)),
          i("26", "Scampi", "mit Krabben", P3(9.5, 10.5, 12.9)),
          i("27", "Bella", "mit Oliven, Mozzarella, Zwiebeln & fr. Tomaten", P3(9.5, 10.5, 12.9)),
          i("29", "Milano", "mit Spinat, Weichkäse, fr. Tomaten & Knoblauch", P3(9.5, 10.5, 12.9)),
          i("30", "Caprisco", "mit Thunfisch, Mais, Spinat", P3(9.5, 10.5, 12.9)),
          i("31", "Pizza Mexico", "mit Bolognesesauce, Paprika & Jalapeños", P3(9.5, 10.5, 12.9)),
          i("32", "Balkan Pizza", "mit Sucuk, Weichkäse, Tomate & Jalapeños", P3(9.5, 10.5, 12.9)),
          i("33", "Döner Calzone Pizza", "zugeklappt mit Dönerfleisch, Paprika & Zwiebeln", P3(9.5, 10.5, 12.9)),
          i("34", "Aloa", "mit Thunfisch & Ananas", P3(9.5, 10.5, 12.9)),
          i("35", "Spaghetti", "mit Hackfleischsauce und Spaghetti", P3(9.5, 10.5, 12.9)),
          i("36", "Parma", "mit Parmaschinken, Mozzarella & frischen Tomaten", P3(9.5, 10.5, 12.9)),
          i("37", "Pizza Witzhelden", "mit Tomatensauce, Dönerfleisch & Sauce Hollandaise", P3(9.5, 10.5, 13.0)),
          i("37a", "Pizza Solingen", "mit Salami, Dönerfleisch & Formvorderschinken", P3(9.5, 10.5, 13.0)),
          i("37b", "Pizza Burscheid", "mit Garnelen & Knoblauch", P3(9.5, 10.5, 13.0)),
          i("37c", "Pizza Leichlingen", "mit Hähnchenbrustfilet, Broccoli, Ananas, Mais & BBQ-Sauce", P3(9.5, 10.5, 13.0)),
          i("37d", "Fritten Pizza", "mit Dönerfleisch, Pommes & Sauce Hollandaise", P3(9.5, 10.5, 13.0)),
        ],
      },
    ],
  },
  {
    id: "pizzabroetchen",
    title: "Pizzabrötchen",
    note: "mit Aioli oder Kräuterbutter",
    sections: [
      {
        items: [
          i("55", "Pizzabrötchen", "mit Kräuterbutter", [5.0], { unit: "10 St." }),
          i("56", "Pizzabrötchen", "mit Aioli", [5.0], { unit: "10 St." }),
          i("57", "Pizzabrötchen", "gefüllt mit Käse", [7.0], { unit: "6 St." }),
          i("58", "Pizzabrötchen", "gefüllt mit Thunfisch & Käse", [8.5], { unit: "6 St." }),
          i("59", "Pizzabrötchen", "gefüllt mit Salami & Käse", [8.5], { unit: "6 St." }),
          i("60", "Pizzabrötchen", "gefüllt mit Formvorderschinken & Käse", [8.5], { unit: "6 St." }),
          i("61", "Pizzabrötchen", "gefüllt mit Spinat & Fetakäse", [8.5], { unit: "6 St." }),
          i("62", "Pizzabrötchen", "gefüllt mit Formvorderschinken, Salami & Käse", [9.0], { unit: "6 St." }),
          i("63", "Pizzabrötchen", "gefüllt mit Dönerfleisch, Zwiebeln & Käse", [9.0], { unit: "6 St." }),
          i("64", "Pizzabrötchen", "gefüllt mit Formvorderschinken, Ananas & Käse", [9.0], { unit: "6 St." }),
          i("64a", "Pizzabrötchen", "gefüllt mit Sucuk (türk. Knoblauchwurst) & Käse", [9.0], { unit: "6 St." }),
        ],
      },
    ],
  },
  {
    id: "pasta",
    title: "Pasta",
    note: "Spaghetti, Tortellini, Rigatoni oder Tagliatelle",
    sections: [
      {
        title: "Spaghetti",
        items: [
          i("65", "Napoli", "mit Tomatensauce", [8.9]),
          i("66", "Bolognese", "mit Bolognesesauce", [9.5]),
          i("67", "Carbonara", "mit Formvorderschinken, Ei & Sahnesauce", [10.0]),
          i("68", "Aglio e Olio", "mit fr. Tomaten, Peperoni, Knoblauch & Olivenöl", [10.0]),
          i("69", "Frutti di Mare", "mit Meeresfrüchten & Tomaten-Sahnesauce", [11.5]),
          i("70", "Al Forno", "mit Gehacktem, Formvorderschinken & Ei in Tomatensauce", [11.0]),
          i("71", "Diavola", "mit Jalapeños, fr. Champignons, Formvorderschinken, Tomaten-Sahnesauce", [10.0]),
          i("72", "Döner", "mit Dönerfleisch, Paprika & Sahnesauce", [10.0]),
          i("73", "Tropical", "mit Thunfisch, Ananas & Sahnesauce", [11.5]),
          i("73a", "Garnelen", "mit Tomaten-Sahnesauce & Garnelen", [11.5]),
        ],
      },
      {
        title: "Tortellini & Lasagne",
        items: [
          i("74", "Bolognese", "mit Bolognesesauce", [9.9]),
          i("75", "Crema", "mit Formvorderschinken & Sahnesauce", [10.0]),
          i("76", "Spinaci", "Gorgonzola, Spinat, Knoblauch in Sahnesauce", [10.0]),
          i("77", "Alla Chef", "mit Formvorderschinken, fr. Champignons & Tomatensahnesauce", [10.5]),
          i("78", "Al Döner", "mit Dönerfleisch, Formvorderschinken, fr. Champignons & Tomatensahnesauce", [11.0]),
          i("79", "Chicky", "mit Hähnchenbrust, fr. Champignons, Zwiebeln & Tomatensahnesauce", [10.5]),
          i("80", "Lasagne al Forno", "mit Bolognesesauce, überbacken", [11.0]),
          i("80a", "Lasagne", "mit Spinat & Tomatensauce, überbacken", [11.0]),
          i("80b", "Lasagne", "mit Dönerfleisch & Tomatensauce, überbacken", [11.0]),
          i("80c", "Quattro Formaggi", "4 verschiedene Käsesorten & Sahnesauce", [10.5]),
          i("80d", "El Chico", "Broccoli, Knoblauch, Shrimps & Tomatensauce", [11.5]),
          i("80e", "Garnelen", "mit Tomatensahnesauce & Garnelen", [11.5]),
        ],
      },
      {
        title: "Rigatoni",
        items: [
          i("81", "Napoli", "mit Tomatensauce", [9.9]),
          i("82", "Bolognese", "mit Bolognesesauce", [9.5]),
          i("83", "Al Broccoli", "mit Broccoli, Knoblauch & Tomatensahnesauce", [10.5]),
          i("84", "Al Vegie", "mit Broccoli, Spinat, Oliven, Peperoni & Knoblauch", [10.5]),
          i("85", "Alla Panna", "mit Sahnesauce, Formvorderschinken & Spiegelei", [10.5]),
          i("85a", "Roma", "mit Paprika, Zwiebeln, Oliven & Tomatensauce", [10.5]),
          i("85b", "Garnelen", "mit Garnelen & Tomaten-Sahnesauce", [11.5]),
          i("85c", "Orchidea", "mit Hähnchenbrust, Champignons, Zwiebeln, Sahnesauce", [11.5]),
        ],
      },
      {
        title: "Tagliatelle",
        items: [
          i("86", "Bolognese", "mit Bolognesesauce", [9.5]),
          i("87", "Napoli", "mit Tomatensauce", [9.0]),
          i("88", "Chicken Delikate", "mit Hähnchenbrust, Champignons, Broccoli, Sahnesauce", [10.5]),
          i("89", "Kebap", "mit Dönerfleisch, Paprika & Tomatensahnesauce", [10.5]),
          i("90", "El Mexico", "mit Formvorderschinken, Champignons, Jalapeños, Paprika & Tomatensahnesauce", [10.5]),
          i("91", "Gemüse", "mit Champignons, Spinat, Broccoli & Tomatensahnesauce", [10.5]),
          i("91a", "Orientale", "mit Champignons, Spinat, Broccoli, Knoblauch, Tomatensauce", [10.5]),
          i("91b", "Frutti di Mare", "mit Meeresfrüchten, Knoblauch, Tomatensauce", [11.5]),
          i("91c", "Gambas", "mit Garnelen, Knoblauch, Tomatensauce", [11.5]),
          i("91d", "Polo", "mit Hähnchenbrust, Champignons, Sahnesauce, Curry", [11.5]),
        ],
      },
    ],
  },
  {
    id: "doener",
    title: "Döner & Grill",
    note: "Taschen, Dürüm, Teller, überbacken & Türkische Pizza",
    sections: [
      {
        title: "Döner Gerichte",
        items: [
          i("92", "Vegetarische Tasche", "mit Weichkäse, Salat & Sauce", [7.0]),
          i("93", "Thunfisch Tasche", "mit Thunfisch, Salat & Tzatziki", [7.5]),
          i("94", "Döner Tasche", "mit Dönerfleisch, Tzatziki & Salat", [8.0]),
          i("95", "Döner Dürüm", "mit Dönerfleisch eingerollt im Wrap, Tzatziki & Salat", [8.5]),
          i("95a", "Chicken Wrap", "mit Crispy Chicken, Salat & Tzatziki", [9.0]),
          i("96", "Pomm Döner", "mit Dönerfleisch, Pommes & Tzatziki", [8.0]),
          i("97", "Döner Teller", "mit Salat & Tzatziki", [12.0]),
          i("98", "Döner Teller", "mit Pommes & Tzatziki", [12.0]),
          i("99", "Döner Teller", "mit Pommes, Salat & Tzatziki", [13.0]),
          i("99a", "Döner Teller", "mit Bratkartoffeln, Salat & Tzatziki", [13.5]),
          i("99b", "Taxi Teller", "mit Döner, Pommes & Currywurst", [15.0]),
          i("99c", "Döner Teller", "mit Reis, Tzatziki & Salat", [14.0]),
          i("100a", "Portion Döner", "in der Schale", [12.0]),
          i("101", "Vegetarischer Dürüm", "mit Salat & Tzatziki", [6.0]),
        ],
      },
      {
        title: "Döner überbacken",
        items: [
          i("102", "Döner Überbacken", "mit Goudakäse, Ananas & Salat", [12.5]),
          i("103", "Döner Überbacken", "mit Sauce Hollandaise, Käse überbacken & Pommes", [12.5]),
          i("104", "Döner Überbacken", "mit fr. Champignons, Sahnesauce, Käse überbacken & Pommes", [12.5]),
          i("105", "Döner Überbacken", "mit Zwiebeln, Paprika, fr. Tomaten, Tomatensahnesauce, Käse überbacken & Pommes", [12.5]),
        ],
      },
      {
        title: "Türkische Pizza",
        items: [
          i("109", "Türkische Pizza", "ohne alles", [5.0]),
          i("110", "Türkische Pizza", "mit Salat, Weichkäse & Tzatziki", [8.0]),
          i("111", "Türkische Pizza", "mit Salat & Tzatziki", [7.0]),
          i("112", "Türkische Pizza", "mit Dönerfleisch, Salat, Weichkäse & Tzatziki", [9.0]),
        ],
      },
    ],
  },
  {
    id: "falafel",
    title: "Falafel",
    sections: [
      {
        items: [
          i("113", "Falafel Tasche", "mit Salat & Tzatziki", [8.0]),
          i("114", "Falafel Teller", "mit Pommes, Salat & Tzatziki", [12.0]),
          i("115", "Falafel Teller", "mit Salat & Tzatziki", [10.0]),
          i("116", "Falafel Dürüm", "mit Salat & Tzatziki", [9.0]),
        ],
      },
    ],
  },
  {
    id: "schnitzel",
    title: "Schnitzel",
    sections: [
      {
        items: [
          i("135", "Wiener Art", "mit Zitrone", [11.9]),
          i("136", "Rahm Schnitzel", "mit Rahmsauce & Champignons", [12.9]),
          i("137", "Jäger Schnitzel", "mit Jägersauce", [12.9]),
          i("138", "Paprika Schnitzel", "mit Paprikasauce", [12.9]),
          i("139", "Hawaii Schnitzel", "mit Ananas, Formvorderschinken & Käse überbacken", [13.9]),
          i("140", "Zwiebelschnitzel", "mit gebratenen Zwiebeln & Knoblauch", [13.9]),
          i("140a", "Bolognese Schnitzel", "mit Hackfleischsauce & Käse überbacken", [13.9]),
          i("141", "Hähnchen Schnitzel", "mit Zitrone", [11.9]),
          i("142", "Curryschnitzel", "mit Currysauce", [12.9]),
          i("143", "Schnitzel Hollandaise", "mit Hollandaisesauce, überbacken", [13.5]),
          i("144", "Spinaci Schnitzel", "mit Spinat & Tomatensahnesauce", [13.9]),
          i("145", "Schnitzel nach Art des Hauses", "mit Spiegelei", [13.5]),
          i("146", "Hähnchen Rahmschnitzel", "mit Rahmsauce & Champignons", [13.5]),
        ],
      },
    ],
  },
  {
    id: "burger",
    title: "Burger",
    note: "100 % Rindfleischpatty – 180 g. Alle Brioche-Burger belegt mit Eisbergsalat, Gurken, roten Zwiebeln & Tomaten",
    sections: [
      {
        items: [
          i("185", "Dönerburger", "mit Dönerfleisch", [9.5]),
          i("186", "Dönerburger", "mit Dönerfleisch & Pommes", [11.5]),
          i("187", "Hamburger", undefined, [10.0]),
          i("188", "Hamburger", "mit Pommes", [12.0]),
          i("189", "Cheeseburger", "mit Cheddar", [11.5]),
          i("190", "Cheeseburger", "mit Cheddar & Pommes", [13.5]),
          i("191", "Crispy Chicken Burger", undefined, [9.5]),
          i("192", "Crispy Chicken Burger", "mit Pommes", [11.5]),
          i("193", "BBQ Burger", undefined, [10.5]),
          i("194", "BBQ Burger", "mit Pommes", [12.5]),
          i("195", "Jalapeños Burger", undefined, [10.5]),
          i("196", "Jalapeños Burger", "mit Pommes", [12.5]),
          i("197", "Double Burger", undefined, [14.5]),
          i("198", "Double Burger", "mit Pommes", [16.5]),
        ],
      },
    ],
  },
  {
    id: "nuggets-wings",
    title: "Nuggets & Wings",
    sections: [
      {
        items: [
          i("200", "Nuggets 6 Stück", "mit Sauce", [6.0]),
          i("201", "Nuggets 6 Stück", "mit Pommes & Sauce", [8.0]),
          i("202", "Nuggets 9 Stück", "mit Sauce", [8.0]),
          i("203", "Nuggets 9 Stück", "mit Pommes & Sauce", [10.5]),
          i("204", "Chicken Wings 6 Stück", "mit Sauce", [7.5]),
          i("205", "Chicken Wings 6 Stück", "mit Pommes & Sauce", [10.0]),
          i("206", "Chicken Wings 9 Stück", "mit Sauce", [9.0]),
          i("207", "Chicken Wings 9 Stück", "mit Pommes & Sauce", [11.5]),
        ],
      },
    ],
  },
  {
    id: "auflaeufe",
    title: "Aufläufe",
    sections: [
      {
        items: [
          i("215", "Averna", "mit Kartoffeln, Dönerfleisch, Champignons in Sahnesauce & Käse überbacken", [12.5]),
          i("216", "Italiano", "mit Kartoffeln, Hähnchenbrustfilet, fr. Tomaten, Tomatensahnesauce & Käse überbacken", [12.5]),
          i("217", "Antep", "mit Kartoffeln, Hähnchenfleisch, Zwiebeln, Tomaten, Olivenöl & Käse überbacken", [12.5]),
          i("218", "Inferno", "mit Kartoffeln, Blattspinat, Krabben, Tomaten-Sahnesauce & Käse überbacken", [12.5]),
          i("219", "Döner-Auflauf", "mit Kartoffeln, Dönerfleisch, Weichkäse, Tomatensahnesauce & Käse überbacken", [12.5]),
          i("220", "Hawaii", "mit Kartoffeln, Formvorderschinken, Ananas in Sahnesauce & Käse überbacken", [12.5]),
          i("221", "Chicken", "mit Kartoffeln, Mozzarella, in Sahnesauce & Käse überbacken", [12.5]),
          i("222", "Quick", "mit Kartoffeln, Spinat, Sauce Hollandaise & Käse überbacken", [12.5]),
          i("223", "Kartoffeln Spezial", "mit Kartoffeln, Shrimps, Knoblauch, fr. Tomaten, in Sahnesauce & Käse überbacken", [12.5]),
          i("224", "Gemüse Chicken", "mit Hähnchenfleisch, Tomaten-Sahnesauce, Käse überbacken", [12.5]),
          i("225", "Art des Hauses", "mit Kartoffeln, Spinat, Broccoli, Champignons, Hollandaisesauce & Käse überbacken", [12.5]),
          i("226", "Döner Spezial", "mit Dönerfleisch, Peperoni, Weichkäse in Tomaten-Sahnesauce & Käse überbacken", [12.5]),
        ],
      },
    ],
  },
  {
    id: "baguettes",
    title: "Baguettes",
    note: "belegt mit Remoulade, Tomaten, Gurken & Eisbergsalat",
    sections: [
      {
        items: [
          i("250", "Käse", "mit Käse", [7.0]),
          i("251", "Thunfisch", "mit Thunfisch & Käse", [8.0]),
          i("252", "Schinken & Salami", "mit Salami & Formvorderschinken", [8.5]),
          i("253", "Polo", "mit Hähnchenbrust & Käse", [9.5]),
          i("254", "Hawaii", "mit Formvorderschinken, Ananas", [9.5]),
          i("255", "Sucuk", "mit Sucuk", [8.5]),
          i("256", "Bella", "mit Salami, Ei & Käse", [8.5]),
          i("257", "Falafel", "mit Falafel & Käse", [8.5]),
          i("258", "Shrimps", "mit gebratenen Shrimps & Käse", [9.5]),
        ],
      },
    ],
  },
  {
    id: "salate",
    title: "Salate",
    priceLabels: ["klein", "groß"],
    sections: [
      {
        items: [
          i("270", "Krautsalat", "Portion Krautsalat", [6.5, 7.5]),
          i("271", "Mista", "Salat, Tomaten, Gurken, Mais, Paprika", [7.0, 8.0]),
          i("272", "Insalata Rialto", "mit Hähnchenbrust, geb. Champignons, Tomaten, Gurken, Mais", [9.5, 10.5]),
          i("273", "Insalata Tonno", "mit Eisbergsalat, Thunfisch, Zwiebeln, Käse, Tomaten, Gurken, Oliven & Ei", [9.0, 10.0]),
          i("274", "Crispy Chicken", "mit Eisbergsalat, Tomaten, Gurken, Mais, Möhren, Crispy Chicken", [9.0, 10.0]),
          i("275", "Falafel Salat", "mit Tomaten, Gurken, Mais, Möhren, Paprika & Falafel", [12.0]),
          i("276", "Eisbergsalat Bosporus", "mit Eisbergsalat, Oliven, Zwiebeln, Weichkäse, milden Peperoni & Peperoni", [9.5, 11.5]),
          i("277", "Bauernsalat", "mit Salat, Tomaten, Gurken, Zwiebeln, Weichkäse, milden Peperoni", [8.0, 9.0]),
          i("278", "Witzhelden", "mit Salat, Tomaten, Gurken, Mais, Thunfisch, Artischocken, Ei, Vorderschinken, Zwiebeln & Käse", [9.5, 11.5]),
        ],
      },
    ],
  },
  {
    id: "kids",
    title: "Kids Menü",
    note: "Jede Kiddy Box mit 1 Menü nach Wahl + 1 Überraschung & 1 Softgetränk",
    sections: [
      {
        items: [
          i("39", "Chicky", "mit 4 Nuggets (Hähnchenformfleisch) & 1 kleinen Pommes", [8.5]),
          i("40", "Sponge Bob", "Pizza mit Thunfisch & Käse", [9.5]),
          i("41", "Goofy Pizza", "Pizza mit Salami & Käse", [9.5]),
          i("42", "Mickey Pizza", "Pizza mit Käse", [8.5]),
          i("43", "Dönerteller klein", "Döner, Pommes & Tzatziki", [9.5]),
          i("44", "Pepper Wutz", "Pizza mit Salami & Vorderschinken", [9.5]),
        ],
      },
    ],
  },
  {
    id: "dessert",
    title: "Dessert",
    sections: [{ items: [i("295", "Spaghetti Eis", undefined, [7.5])] }],
  },
  {
    id: "getraenke",
    title: "Getränke",
    sections: [
      {
        items: [
          i("", "Softdrinks", "Cola, Fanta, Sprite, Mezzo Mix, Multivitamin, Uludağ", [2.5], { unit: "0,33 l" }),
          i("", "Softdrinks & Wasser", "Cola, Fanta, Sprite, Mezzo Mix, Wasser (nur außer Haus, PET)", [3.5], { unit: "1 l" }),
          i("", "Wasser", undefined, [2.0], { unit: "0,5 l" }),
          i("", "Durstlöscher", undefined, [2.0], { unit: "0,5 l" }),
          i("", "Bier", "verschiedene Sorten", [2.5], { unit: "0,33 l" }),
          i("", "Wein", "Rot, Weiß, Rosé, Lambrusco", [7.0], { unit: "0,7 l" }),
          i("", "Chianti", undefined, [9.0], { unit: "0,7 l" }),
          i("", "Frascati", undefined, [9.0], { unit: "0,7 l" }),
        ],
      },
    ],
  },
];

export const formatPrice = (value: number) =>
  value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Number of food dishes (drinks excluded) — used for factual copy. */
export const dishCount = menu
  .filter((c) => c.id !== "getraenke")
  .reduce((sum, c) => sum + c.sections.reduce((s, sec) => s + sec.items.length, 0), 0);

export const findItem = (no: string): MenuItem | undefined => {
  for (const c of menu) for (const s of c.sections) for (const it of s.items) if (it.no === no) return it;
  return undefined;
};
