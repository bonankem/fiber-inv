import { Card, Descriptions, Modal, Tabs, Tooltip } from "antd";
import type { StaffRole } from "schema/enums";
import type { FtthSurveyT } from "schema/fhs";
import type { CoordsT } from "schema/geo";
import type { Maybe } from "schema/utils";
import type { WorkT } from "schema/work";
import StatusView from "#/components/StatusView";
import type { ModalItemProps } from "#/hooks/useModalViewer";

function worker(work: WorkT, role: StaffRole) {
  return work.workers.find((w) => w.role === role)?.user;
}

function CoordsLink(props: { coords: Maybe<CoordsT> }) {
  const c = props.coords;
  if (!c) return undefined;

  const ns = c.lat >= 0 ? "N" : "S";
  const ew = c.lon >= 0 ? "E" : "W";
  const lat = Math.abs(c.lat).toFixed(5);
  const lon = Math.abs(c.lon).toFixed(5);
  const text = `${lat}°${ns}, ${lon}°${ew}`;
  const link = `https://www.google.com/maps/place/${c.lat},${c.lon}`;
  return (
    <Tooltip title="View on Google Maps">
      <a href={link} target="_blank" rel="noopener noreferrer">
        {text}
      </a>
    </Tooltip>
  );
}

export default function FhsDetailsModal(props: ModalItemProps<FtthSurveyT>) {
  const s = props.item;
  const w = s.work;
  const isAbidjan = w.locality?.district?.name === "Abidjan";

  return (
    <Modal
      //   title={s.work.sid}
      width={800}
      open={props.state.isOpen}
      onCancel={props.state.close}
      mask={{ blur: true, closable: true }}
      okButtonProps={{ className: "hidden!" }}
      cancelButtonProps={{ className: "hidden!" }}
      cancelText="Close"
    >
      <Tabs
        type="card"
        // centered
        items={[
          {
            key: "details",
            label: "Détails",
            children: (
              <div className="grid md:grid-cols-2 gap-2">
                <Descriptions
                  bordered
                  size="small"
                  classNames={{
                    content: "text-sm! inline-block! text-right!",
                    label: "text-sm!",
                  }}
                  column={1}
                  items={[
                    {
                      key: "name",
                      label: "Nom",
                      children: w.name,
                    },
                    {
                      key: "sid",
                      label: "ID",
                      children: w.sid,
                    },
                    {
                      key: "status",
                      label: "Statut",
                      children: <StatusView work={w} />,
                    },
                    {
                      key: "locality",
                      label: isAbidjan ? "Commune" : "Département",
                      children: w.locality?.name,
                    },
                    {
                      key: "district",
                      label: "District",
                      children: w.locality?.district?.name,
                    },
                    {
                      key: "coords",
                      label: "Coordonnées",
                      children: <CoordsLink coords={w.coords} />,
                    },
                    {
                      key: "contact",
                      label: "Contact",
                      children: w.contact,
                    },
                    {
                      key: "engineer",
                      label: "Chargé",
                      children: worker(w, "PLANNING_ENGINEER")?.name,
                    },
                    {
                      key: "vendor",
                      label: "Fournisseur",
                      children: w.vendor?.name,
                    },
                  ]}
                />
                <Card />
              </div>
            ),
          },
          { key: "logs", label: "Journaux" },
        ]}
      />
    </Modal>
  );
}
