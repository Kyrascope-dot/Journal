"use client";

import { useCallback, useEffect, useState } from "react";
import { BulkEmailComposer } from "@/components/dashboard/communications/BulkEmailComposer";
import {
  requestCommunicationCampaigns,
  requestCommunicationTemplates,
  requestCommunicationsStats,
  requestExportCampaignCsv,
  requestProcessCampaignBatch,
  requestSaveCommunicationTemplate,
} from "@/lib/client/admin-communications";
import type {
  CommunicationsStats,
  EmailCampaignSummary,
  EmailTemplateRecord,
} from "@/types/communications";
import type { SubmissionPurpose, UserProfile } from "@/types/dashboard";

type CommTab = "overview" | "conference" | "journal" | "templates" | "campaigns";

export function CommunicationsPanel({
  editors,
  reviewers,
}: {
  editors: UserProfile[];
  reviewers: UserProfile[];
}) {
  const [tab, setTab] = useState<CommTab>("overview");
  const [stats, setStats] = useState<CommunicationsStats | null>(null);
  const [templates, setTemplates] = useState<EmailTemplateRecord[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [composerPurpose, setComposerPurpose] = useState<SubmissionPurpose | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [editTemplate, setEditTemplate] = useState<EmailTemplateRecord | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    audience: "both" as EmailTemplateRecord["audience"],
    subject: "",
    bodyHtml: "",
  });
  const [savingTemplate, setSavingTemplate] = useState(false);

  const reload = useCallback(async () => {
    setError("");
    try {
      const [nextStats, nextTemplates, nextCampaigns] = await Promise.all([
        requestCommunicationsStats(),
        requestCommunicationTemplates(),
        requestCommunicationCampaigns(),
      ]);
      setStats(nextStats);
      setTemplates(nextTemplates);
      setCampaigns(nextCampaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load communications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  function openComposer(purpose: SubmissionPurpose) {
    setComposerPurpose(purpose);
  }

  function startEditTemplate(template?: EmailTemplateRecord) {
    if (template) {
      setEditTemplate(template);
      setTemplateForm({
        name: template.name,
        description: template.description,
        audience: template.audience,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
      });
    } else {
      setEditTemplate(null);
      setTemplateForm({
        name: "",
        description: "",
        audience: "both",
        subject: "",
        bodyHtml: "<p>Dear {{authorName}},</p>\n<p></p>",
      });
    }
    setTab("templates");
  }

  async function saveTemplate() {
    setSavingTemplate(true);
    setError("");
    try {
      await requestSaveCommunicationTemplate({
        id: editTemplate?.id,
        ...templateForm,
      });
      setEditTemplate(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save template.");
    } finally {
      setSavingTemplate(false);
    }
  }

  async function processBatch(campaignId: string) {
    setProcessingId(campaignId);
    setError("");
    try {
      let result = await requestProcessCampaignBatch(campaignId);
      let campaign = result.campaign;
      while (
        (campaign.status === "queued" || campaign.status === "sending") &&
        result.processed > 0
      ) {
        result = await requestProcessCampaignBatch(campaignId);
        campaign = result.campaign;
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch processing failed.");
    } finally {
      setProcessingId(null);
    }
  }

  const tabs: { key: CommTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "conference", label: "Conference bulk" },
    { key: "journal", label: "Journal bulk" },
    { key: "templates", label: "Templates" },
    { key: "campaigns", label: "Campaign log" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
            Communications
          </h2>
          <p className="mt-1 text-sm text-[var(--journal-muted)]">
            Bulk and individual author emails. Status-notification emails are unchanged.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void reload();
          }}
          className="text-sm font-medium text-[var(--journal-accent)] hover:underline"
        >
          Refresh
        </button>
      </div>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-[var(--journal-border)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t.key
                ? "border-[var(--journal-accent)] text-[var(--journal-accent)]"
                : "border-transparent text-[var(--journal-muted)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {error ? (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-100" />
          ))}
        </div>
      ) : null}

      {!loading && tab === "overview" && stats ? (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Campaigns", value: stats.totalCampaigns },
              { label: "Queued / scheduled", value: stats.queued },
              { label: "Emails sent", value: stats.emailsSent },
              { label: "Templates", value: stats.templateCount },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-lg border border-[var(--journal-border)] bg-white p-4 text-center shadow-sm"
              >
                <p className="text-2xl font-bold text-[var(--journal-heading)]">{card.value}</p>
                <p className="mt-1 text-xs text-[var(--journal-muted)]">{card.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openComposer("conference")}
              className="rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white"
            >
              Compose conference bulk
            </button>
            <button
              type="button"
              onClick={() => openComposer("journal")}
              className="rounded border border-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-[var(--journal-accent)]"
            >
              Compose journal bulk
            </button>
          </div>
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-[var(--journal-heading)]">
              Recent campaigns
            </h3>
            <CampaignTable
              campaigns={stats.recentCampaigns}
              processingId={processingId}
              onProcess={(id) => void processBatch(id)}
            />
          </div>
        </div>
      ) : null}

      {!loading && tab === "conference" ? (
        <div className="mt-6">
          <p className="text-sm text-[var(--journal-muted)]">
            Filter conference abstracts by status, best-paper nominees, category, quarter (Q3
            default in composer), registration ID, author, email, and date range.
          </p>
          <button
            type="button"
            onClick={() => openComposer("conference")}
            className="mt-4 rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white"
          >
            Open conference composer
          </button>
          <CampaignTable
            campaigns={campaigns.filter((c) => c.purpose === "conference")}
            processingId={processingId}
            onProcess={(id) => void processBatch(id)}
          />
        </div>
      ) : null}

      {!loading && tab === "journal" ? (
        <div className="mt-6">
          <p className="text-sm text-[var(--journal-muted)]">
            Filter journal manuscripts by status, category, editor, reviewer, registration ID,
            author, email, and date range.
          </p>
          <button
            type="button"
            onClick={() => openComposer("journal")}
            className="mt-4 rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white"
          >
            Open journal composer
          </button>
          <CampaignTable
            campaigns={campaigns.filter((c) => c.purpose === "journal")}
            processingId={processingId}
            onProcess={(id) => void processBatch(id)}
          />
        </div>
      ) : null}

      {!loading && tab === "templates" ? (
        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => startEditTemplate()}
              className="rounded bg-[var(--journal-accent)] px-3 py-1.5 text-sm font-medium text-white"
            >
              New template
            </button>
          </div>

          <div className="overflow-x-auto rounded border border-[var(--journal-border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-sky-50 text-xs text-[var(--journal-muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Audience</th>
                  <th className="px-3 py-2 font-medium">Subject</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr
                    key={template.id}
                    className="border-t border-[var(--journal-border)] align-top"
                  >
                    <td className="px-3 py-2">
                      <p className="font-medium text-[var(--journal-heading)]">{template.name}</p>
                      <p className="text-xs text-[var(--journal-muted)]">{template.description}</p>
                    </td>
                    <td className="px-3 py-2 capitalize">{template.audience}</td>
                    <td className="px-3 py-2 text-xs">{template.subject}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => startEditTemplate(template)}
                        className="text-xs font-medium text-[var(--journal-accent)] hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-[var(--journal-border)] bg-white p-4">
            <h3 className="text-sm font-semibold text-[var(--journal-heading)]">
              {editTemplate ? "Edit template" : "Create template"}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                value={templateForm.name}
                onChange={(e) => setTemplateForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Name"
                className="rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
              />
              <select
                value={templateForm.audience}
                onChange={(e) =>
                  setTemplateForm((f) => ({
                    ...f,
                    audience: e.target.value as EmailTemplateRecord["audience"],
                  }))
                }
                className="rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
              >
                <option value="both">Both</option>
                <option value="conference">Conference</option>
                <option value="journal">Journal</option>
              </select>
              <input
                value={templateForm.description}
                onChange={(e) =>
                  setTemplateForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description"
                className="rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm sm:col-span-2"
              />
              <input
                value={templateForm.subject}
                onChange={(e) => setTemplateForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="Subject"
                className="rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm sm:col-span-2"
              />
              <textarea
                value={templateForm.bodyHtml}
                onChange={(e) => setTemplateForm((f) => ({ ...f, bodyHtml: e.target.value }))}
                rows={8}
                placeholder="HTML body"
                className="rounded border border-[var(--journal-border)] px-3 py-2 font-mono text-xs sm:col-span-2"
              />
            </div>
            <button
              type="button"
              disabled={savingTemplate}
              onClick={() => void saveTemplate()}
              className="mt-3 rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {savingTemplate ? "Saving…" : "Save template"}
            </button>
          </div>
        </div>
      ) : null}

      {!loading && tab === "campaigns" ? (
        <div className="mt-6">
          <CampaignTable
            campaigns={campaigns}
            processingId={processingId}
            onProcess={(id) => void processBatch(id)}
          />
        </div>
      ) : null}

      {composerPurpose ? (
        <BulkEmailComposer
          open
          purpose={composerPurpose}
          templates={templates}
          editors={editors}
          reviewers={reviewers}
          onClose={() => setComposerPurpose(null)}
          onCampaignChange={() => void reload()}
          onTemplatesChange={() => void reload()}
        />
      ) : null}
    </div>
  );
}

function CampaignTable({
  campaigns,
  processingId,
  onProcess,
}: {
  campaigns: EmailCampaignSummary[];
  processingId: string | null;
  onProcess: (id: string) => void;
}) {
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportError, setExportError] = useState("");

  async function exportCsv(campaignId: string) {
    setExportingId(campaignId);
    setExportError("");
    try {
      await requestExportCampaignCsv(campaignId);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExportingId(null);
    }
  }

  if (campaigns.length === 0) {
    return (
      <p className="mt-4 text-sm text-[var(--journal-muted)]">No campaigns yet.</p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded border border-[var(--journal-border)]">
      {exportError ? (
        <p className="border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {exportError}
        </p>
      ) : null}
      <table className="min-w-full text-left text-sm">
        <thead className="bg-sky-50 text-xs text-[var(--journal-muted)]">
          <tr>
            <th className="px-3 py-2 font-medium">Campaign</th>
            <th className="px-3 py-2 font-medium">Purpose</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Progress</th>
            <th className="px-3 py-2 font-medium">Created</th>
            <th className="px-3 py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-t border-[var(--journal-border)]">
              <td className="px-3 py-2">
                <p className="font-medium text-[var(--journal-heading)]">{campaign.name}</p>
                <p className="text-xs text-[var(--journal-muted)]">{campaign.subject}</p>
              </td>
              <td className="px-3 py-2 capitalize">{campaign.purpose}</td>
              <td className="px-3 py-2 capitalize">{campaign.status}</td>
              <td className="px-3 py-2 text-xs">
                {campaign.sentCount}/{campaign.totalRecipients}
                {campaign.failedCount ? ` · ${campaign.failedCount} failed` : ""}
                {campaign.pendingCount ? ` · ${campaign.pendingCount} pending` : ""}
              </td>
              <td className="px-3 py-2 text-xs text-[var(--journal-muted)]">
                {campaign.createdAt
                  ? new Date(campaign.createdAt).toLocaleString("en-GB")
                  : "—"}
              </td>
              <td className="px-3 py-2 text-right">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={exportingId === campaign.id}
                    onClick={() => void exportCsv(campaign.id)}
                    className="text-xs font-medium text-[var(--journal-muted)] hover:underline disabled:opacity-50"
                  >
                    {exportingId === campaign.id ? "Exporting…" : "Export CSV"}
                  </button>
                  {campaign.status === "queued" ||
                  campaign.status === "sending" ||
                  campaign.status === "scheduled" ? (
                    <button
                      type="button"
                      disabled={processingId === campaign.id}
                      onClick={() => onProcess(campaign.id)}
                      className="text-xs font-medium text-[var(--journal-accent)] hover:underline disabled:opacity-50"
                    >
                      {processingId === campaign.id ? "Processing…" : "Process batch"}
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
