import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/common/Dialog";
import Button from "@/components/common/Button";

/** detail = { title, text, image?, meta? } | null */
export default function DetailDialog({ detail, onClose }) {
  return (
    <Dialog open={detail !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="nova-dialog">
        {detail?.image && <img className="dialog-image" src={detail.image} alt={detail.title} />}
        <div className="dialog-body">
          <p className="eyebrow blue">{detail?.meta}</p>
          <DialogTitle className="dialog-title">{detail?.title}</DialogTitle>
          <DialogDescription className="dialog-description">{detail?.text}</DialogDescription>
          <Button href="#contact" variant="blue" iconSize={18} onClick={onClose}>Enquire with NOVA</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
