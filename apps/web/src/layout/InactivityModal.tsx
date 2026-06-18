import { Modal, Progress } from "antd";
import { m } from "i18n/messages";

const COUNTDOWN_LENGTH = 30;

export default function InactivityModal({ timeLeft }: { timeLeft: number }) {
  const t = Math.floor(timeLeft / 1000);
  const visible = t < COUNTDOWN_LENGTH;

  return (
    <Modal
      title={m.timeout_warning_title()}
      width={360}
      zIndex={5000}
      open={visible}
      footer={false}
      closable={false}
    >
      <div className="text-balance mb-4">
        {m.timeout_warning_line1({ t })}
        <br />
        {m.timeout_warning_line2()}
      </div>
      <Progress
        type="line"
        showInfo={false}
        percent={(t / COUNTDOWN_LENGTH) * 100}
        strokeColor={t <= 10 ? "red" : t <= 20 ? "darkorange" : "orange"}
      />
    </Modal>
  );
}
