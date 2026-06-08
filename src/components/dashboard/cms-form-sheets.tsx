"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Newspaper,
  MessageSquare,
  Handshake,
  Briefcase,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import type { News, Testimonial, Partner, ServiceOffering } from "@prisma/client";
import {
  saveNewsAction,
  deleteNewsAction,
  saveTestimonialAction,
  deleteTestimonialAction,
  savePartnerAction,
  deletePartnerAction,
  saveOfferingAction,
  deleteOfferingAction,
} from "@/app/(dashboard)/admin-actions";
import { Button } from "@/components/ui/button";
import {
  FormSheet,
  FormSection,
  FormField,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  Input,
  inputClass,
} from "@/components/dashboard/form-sheet";
import { NEWS_STATUS_LABELS } from "@/lib/constants";

type NewsItem = Pick<
  News,
  "id" | "slug" | "title" | "excerpt" | "content" | "coverImage" | "status" | "publishedAt"
>;

export function NewsFormSheet({ item }: { item?: NewsItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveNewsAction(new FormData(e.currentTarget), item?.id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(item ? "News updated" : "News created");
    setOpen(false);
    router.refresh();
  }

  const publishedValue = item?.publishedAt
    ? new Date(item.publishedAt).toISOString().slice(0, 16)
    : "";

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title={item ? "Edit Article" : "New Article"}
      description="Publish company news and updates to the public website."
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel={item ? "Update Article" : "Create Article"}
      trigger={
        item ? (
          <Button variant="ghost" size="sm">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="size-4" />
            New Article
          </Button>
        )
      }
    >
      <FormSection icon={Newspaper} title="Article Details">
        <FormField id="title" label="Title" required>
          <Input
            id="title"
            name="title"
            className={inputClass}
            defaultValue={item?.title}
            placeholder="e.g. IDM Expands Nationwide Coverage"
            required
          />
        </FormField>
        <FormField id="slug" label="URL Slug" required hint="Used in the article URL. Use lowercase and hyphens.">
          <Input
            id="slug"
            name="slug"
            className={inputClass}
            defaultValue={item?.slug}
            placeholder="e.g. idm-expands-coverage"
            required
          />
        </FormField>
        <FormField id="excerpt" label="Excerpt" hint="Short summary shown in article listings.">
          <Input
            id="excerpt"
            name="excerpt"
            className={inputClass}
            defaultValue={item?.excerpt ?? ""}
            placeholder="Brief summary of the article..."
          />
        </FormField>
        <FormField id="coverImage" label="Cover Image URL">
          <Input
            id="coverImage"
            name="coverImage"
            className={inputClass}
            defaultValue={item?.coverImage ?? ""}
            placeholder="https://..."
          />
        </FormField>
        <FormField id="content" label="Content" required>
          <FormTextarea
            id="content"
            name="content"
            rows={8}
            required
            defaultValue={item?.content}
            placeholder="Write the full article content here..."
          />
        </FormField>
      </FormSection>

      <FormSection icon={Settings2} title="Publishing">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="status" label="Status" required>
            <FormSelect id="status" name="status" defaultValue={item?.status ?? "DRAFT"} required>
              {Object.entries(NEWS_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </FormSelect>
          </FormField>
          <FormField id="publishedAt" label="Published At">
            <Input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              className={inputClass}
              defaultValue={publishedValue}
            />
          </FormField>
        </div>
      </FormSection>
    </FormSheet>
  );
}

export function DeleteNewsButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this article?")) return;
    setLoading(true);
    const result = await deleteNewsAction(id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Article deleted");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}

type TestimonialItem = Pick<
  Testimonial,
  "id" | "name" | "company" | "role" | "content" | "rating" | "avatarUrl" | "isActive" | "sortOrder"
>;

export function TestimonialFormSheet({ item }: { item?: TestimonialItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveTestimonialAction(new FormData(e.currentTarget), item?.id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(item ? "Testimonial updated" : "Testimonial created");
    setOpen(false);
    router.refresh();
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title={item ? "Edit Testimonial" : "New Testimonial"}
      description="Customer quotes displayed on the public homepage."
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel={item ? "Update Testimonial" : "Add Testimonial"}
      trigger={
        item ? (
          <Button variant="ghost" size="sm">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="size-4" />
            Add Testimonial
          </Button>
        )
      }
    >
      <FormSection icon={MessageSquare} title="Customer Info">
        <FormField id="name" label="Name" required>
          <Input
            id="name"
            name="name"
            className={inputClass}
            defaultValue={item?.name}
            placeholder="e.g. Budi Santoso"
            required
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="company" label="Company">
            <Input
              id="company"
              name="company"
              className={inputClass}
              defaultValue={item?.company ?? ""}
              placeholder="PT / CV name"
            />
          </FormField>
          <FormField id="role" label="Role">
            <Input
              id="role"
              name="role"
              className={inputClass}
              defaultValue={item?.role ?? ""}
              placeholder="e.g. Operations Manager"
            />
          </FormField>
        </div>
        <FormField id="avatarUrl" label="Avatar URL">
          <Input
            id="avatarUrl"
            name="avatarUrl"
            className={inputClass}
            defaultValue={item?.avatarUrl ?? ""}
            placeholder="https://..."
          />
        </FormField>
      </FormSection>

      <FormSection icon={Settings2} title="Quote & Display">
        <FormField id="content" label="Quote" required>
          <FormTextarea
            id="content"
            name="content"
            rows={4}
            required
            defaultValue={item?.content}
            placeholder="What did the customer say about IDM?"
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="rating" label="Rating (1–5)">
            <Input
              id="rating"
              name="rating"
              type="number"
              min={1}
              max={5}
              className={inputClass}
              defaultValue={item?.rating ?? 5}
            />
          </FormField>
          <FormField id="sortOrder" label="Sort Order" hint="Lower numbers appear first.">
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              className={inputClass}
              defaultValue={item?.sortOrder ?? 0}
            />
          </FormField>
        </div>
        <FormCheckbox
          id="isActive"
          name="isActive"
          label="Show on website"
          description="Inactive testimonials are hidden from the public site."
          defaultChecked={item?.isActive ?? true}
        />
      </FormSection>
    </FormSheet>
  );
}

export function DeleteTestimonialButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this testimonial?")) return;
    setLoading(true);
    const result = await deleteTestimonialAction(id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Testimonial deleted");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}

type PartnerItem = Pick<Partner, "id" | "name" | "logoUrl" | "website" | "isActive" | "sortOrder">;

export function PartnerFormSheet({ item }: { item?: PartnerItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await savePartnerAction(new FormData(e.currentTarget), item?.id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(item ? "Partner updated" : "Partner created");
    setOpen(false);
    router.refresh();
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title={item ? "Edit Partner" : "New Partner"}
      description="Client and partner logos shown in the Klien Kami section."
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel={item ? "Update Partner" : "Add Partner"}
      trigger={
        item ? (
          <Button variant="ghost" size="sm">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="size-4" />
            Add Partner
          </Button>
        )
      }
    >
      <FormSection icon={Handshake} title="Partner Details">
        <FormField id="name" label="Name" required>
          <Input
            id="name"
            name="name"
            className={inputClass}
            defaultValue={item?.name}
            placeholder="e.g. PT ABC Logistics"
            required
          />
        </FormField>
        <FormField id="logoUrl" label="Logo URL" required hint="Direct link to the partner logo image.">
          <Input
            id="logoUrl"
            name="logoUrl"
            className={inputClass}
            defaultValue={item?.logoUrl}
            placeholder="https://..."
            required
          />
        </FormField>
        <FormField id="website" label="Website">
          <Input
            id="website"
            name="website"
            className={inputClass}
            defaultValue={item?.website ?? ""}
            placeholder="https://partner-website.com"
          />
        </FormField>
      </FormSection>

      <FormSection icon={Settings2} title="Display">
        <FormField id="sortOrder" label="Sort Order" hint="Lower numbers appear first in the logo grid.">
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            className={inputClass}
            defaultValue={item?.sortOrder ?? 0}
          />
        </FormField>
        <FormCheckbox
          id="isActive"
          name="isActive"
          label="Show on website"
          description="Inactive partners are hidden from the homepage."
          defaultChecked={item?.isActive ?? true}
        />
      </FormSection>
    </FormSheet>
  );
}

export function DeletePartnerButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this partner?")) return;
    setLoading(true);
    const result = await deletePartnerAction(id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Partner deleted");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}

type OfferingItem = Pick<
  ServiceOffering,
  "id" | "slug" | "name" | "description" | "icon" | "isActive" | "sortOrder" | "features"
>;

export function OfferingFormSheet({ item }: { item?: OfferingItem }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const featuresText = Array.isArray(item?.features)
    ? (item.features as string[]).join("\n")
    : "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const result = await saveOfferingAction(new FormData(e.currentTarget), item?.id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(item ? "Service updated" : "Service created");
    setOpen(false);
    router.refresh();
  }

  return (
    <FormSheet
      open={open}
      onOpenChange={setOpen}
      title={item ? "Edit Service" : "New Service"}
      description="Used on the public website and when creating new shipments."
      loading={loading}
      onSubmit={handleSubmit}
      submitLabel={item ? "Update Service" : "Create Service"}
      trigger={
        item ? (
          <Button variant="ghost" size="sm">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button size="sm" className="bg-primary text-primary-foreground">
            <Plus className="size-4" />
            Add Service
          </Button>
        )
      }
    >
      <FormSection icon={Briefcase} title="Service Details">
        <FormField id="name" label="Name" required>
          <Input
            id="name"
            name="name"
            className={inputClass}
            defaultValue={item?.name}
            placeholder="e.g. Express Delivery"
            required
          />
        </FormField>
        <FormField id="slug" label="URL Slug" required hint="Used in the service page URL.">
          <Input
            id="slug"
            name="slug"
            className={inputClass}
            defaultValue={item?.slug}
            placeholder="e.g. express-delivery"
            required
          />
        </FormField>
        <FormField id="description" label="Description" required>
          <FormTextarea
            id="description"
            name="description"
            rows={3}
            required
            defaultValue={item?.description}
            placeholder="Brief description of this service..."
          />
        </FormField>
        <FormField id="icon" label="Icon name" hint="Lucide icon name, e.g. Truck">
          <Input
            id="icon"
            name="icon"
            className={inputClass}
            defaultValue={item?.icon ?? ""}
            placeholder="Truck"
          />
        </FormField>
      </FormSection>

      <FormSection icon={Settings2} title="Features & Display">
        <FormField id="features" label="Features" hint="One feature per line.">
          <FormTextarea
            id="features"
            name="features"
            rows={4}
            defaultValue={featuresText}
            placeholder={"Same-day delivery\nReal-time tracking\nInsurance included"}
          />
        </FormField>
        <FormField id="sortOrder" label="Sort Order" hint="Lower numbers appear first.">
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            className={inputClass}
            defaultValue={item?.sortOrder ?? 0}
          />
        </FormField>
        <FormCheckbox
          id="isActive"
          name="isActive"
          label="Show on website"
          description="Inactive services are hidden from the public site."
          defaultChecked={item?.isActive ?? true}
        />
      </FormSection>
    </FormSheet>
  );
}

export function DeleteOfferingButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this service offering?")) return;
    setLoading(true);
    const result = await deleteOfferingAction(id);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Service deleted");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
