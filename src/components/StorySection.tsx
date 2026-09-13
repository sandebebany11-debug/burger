import { story } from "../data/content";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import "./StorySection.css";

export default function StorySection() {
  const ref = useRevealOnScroll<HTMLDivElement>();

  return (
    <section id="ueber-uns" className="story" aria-labelledby="story-heading">
      <div className="container story__inner">
        {/* Placeholder until a real portrait of Shahram Rahmani is added at /public/assets/hero/shahram.jpg */}
        <div className="story__portrait" aria-hidden="true">
          <div className="story__frame">
            <span className="story__initial">SR</span>
          </div>
        </div>

        <div ref={ref} className="story__copy reveal-up">
          <span className="eyebrow">Über uns</span>
          <h2 id="story-heading" className="section-heading">
            {story.headline}
          </h2>
          <div className="story__text">
            {story.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <p className="story__signature">Shahram Rahmani, Inhaber</p>
        </div>
      </div>
    </section>
  );
}
