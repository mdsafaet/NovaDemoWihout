import Button from "@/components/common/Button";

export default function Contact() {
  return (
    <section className="contact section" id="contact">
      <div>
        <p className="eyebrow">YOUR NEXT CHAPTER</p>
        <h2>Let’s build<br /><em>what comes next.</em></h2>
      </div>
      <div className="contact-copy">
        <p>A new home. A new opportunity. A shared ambition.<br />Your conversation with NOVA starts here.</p>
        <Button href="mailto:info@novadevelopment.com" variant="white">Start a conversation</Button>
        <a className="contact-email" href="mailto:info@novadevelopment.com">info@novadevelopment.com</a>
      </div>
    </section>
  );
}
