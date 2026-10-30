import { Alert, App, Button, Input, Modal, Select } from "antd";
import { useRef, useState } from "react";
import { ftthSurveyFullZ } from "schema/fhs";
import type { EmrfJobT } from "schema/inventory";
import { useAuthToken } from "#/api/auth";
import { getJson, showAppError } from "#/api/helpers";
import EquipmentLinesEditor, {
  checkLines,
  filledLines,
  type LineRowT,
  newLineRow,
} from "#/components/inputs/EquipmentLinesEditor";
import { useCreateEmrf, useEmrfJobs } from "#/modules/hooks/inventory";

type Props = {
  open: boolean;
  onClose: () => void;
};

function jobLabel(job: EmrfJobT) {
  return `${job.work.sid} · ${job.work.name}`;
}

function jobDetails(job: EmrfJobT) {
  const parts = [job.area && `Area ${job.area}`, job.work.vendor?.name];
  parts.push(`${job._count.bom} BOM lines`);
  if (job._count.emrfs) parts.push(`${job._count.emrfs} EMRF already`);
  return parts.filter(Boolean).join(" · ");
}

export function NewEmrfModal({ open, onClose }: Props) {
  const { message } = App.useApp();
  const token = useAuthToken();
  const create = useCreateEmrf();
  const jobs = useEmrfJobs(open);
  const [job, setJob] = useState<EmrfJobT>();
  const [loadingBom, setLoadingBom] = useState(false);
  const [segment, setSegment] = useState("");
  const [rows, setRows] = useState<LineRowT[]>(() => [newLineRow()]);
  const [showErrors, setShowErrors] = useState(false);
  const latestJob = useRef<string>(undefined);

  function close() {
    latestJob.current = undefined;
    setJob(undefined);
    setSegment("");
    setRows([newLineRow()]);
    setShowErrors(false);
    onClose();
  }

  /** Start the request from the BOM approved for the chosen job. */
  async function pickJob(id: string | undefined) {
    const picked = jobs.data?.find((j) => j.id === id);
    latestJob.current = picked?.id;
    setJob(picked);
    if (!picked) return;

    setSegment(picked.area ?? "");
    setLoadingBom(true);
    try {
      const survey = await getJson(
        `fhs/${picked.id}`,
        ftthSurveyFullZ,
        undefined,
        token.value,
      );
      // ignore a slow answer for a job that is no longer selected
      if (latestJob.current !== picked.id) return;
      setRows(
        survey.bom.length
          ? survey.bom.map((b) => newLineRow(b.equipment, b.quantity))
          : [newLineRow()],
      );
    } catch (e) {
      showAppError(e);
    } finally {
      setLoadingBom(false);
    }
  }

  async function submit() {
    setShowErrors(true);
    if (!job) {
      message.error("Select the HP Planning job this request is for");
      return;
    }
    const check = segment.trim()
      ? checkLines(rows)
      : "Enter the segment this request is for";
    if (check !== true) {
      message.error(check);
      return;
    }

    try {
      await create.mutateAsync({
        surveyId: job.id,
        items: filledLines(rows).map((line, position) => ({
          equipmentId: line.item.id,
          segment: segment.trim(),
          position,
          requestQty: line.quantity,
        })),
      });
      message.success("EMRF sent");
      close();
    } catch (e) {
      showAppError(e);
    }
  }

  return (
    <Modal
      destroyOnHidden
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={close}>Cancel</Button>
          <Button
            disabled={loadingBom}
            loading={create.isPending}
            onClick={submit}
            type="primary"
          >
            Submit EMRF
          </Button>
        </div>
      }
      onCancel={close}
      open={open}
      title="Create EMRF"
      width={1100}
    >
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1 md:col-span-2">
            <label htmlFor="emrf-job" className="text-sm font-medium">
              HP Planning job <span className="text-red-500">*</span>
            </label>
            <Select<string>
              allowClear
              id="emrf-job"
              loading={jobs.isLoading}
              notFoundContent={
                jobs.isLoading ? undefined : "No closed HP Planning jobs"
              }
              onChange={pickJob}
              optionFilterProp="label"
              optionRender={(opt) => (
                <div className="flex flex-col py-0.5">
                  <span className="truncate">{opt.data.label}</span>
                  <span className="text-xs opacity-60">
                    {jobDetails(opt.data.job)}
                  </span>
                </div>
              )}
              options={jobs.data?.map((j) => ({
                value: j.id,
                label: jobLabel(j),
                job: j,
              }))}
              placeholder="Select a closed HP Planning job"
              showSearch
              status={showErrors && !job ? "error" : undefined}
              value={job?.id}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="emrf-segment" className="text-sm font-medium">
              Segment <span className="text-red-500">*</span>
            </label>
            <Input
              id="emrf-segment"
              onChange={(e) => setSegment(e.target.value)}
              placeholder="Area code, project or network segment"
              status={showErrors && !segment.trim() ? "error" : undefined}
              value={segment}
            />
          </div>
        </div>

        {job && job._count.bom === 0 && (
          <Alert
            showIcon
            type="warning"
            message="This job has no BOM lines from the inventory, so add the items yourself."
          />
        )}
        {job && job._count.emrfs > 0 && (
          <Alert
            showIcon
            type="info"
            message={`This job already has ${job._count.emrfs} EMRF. Check it before requesting the same materials again.`}
          />
        )}

        <EquipmentLinesEditor
          loading={loadingBom}
          onChange={setRows}
          rows={rows}
          showErrors={showErrors}
        />
      </div>
    </Modal>
  );
}
