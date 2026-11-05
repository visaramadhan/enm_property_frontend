"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Kumpulan field formulir bersama.
 *
 * Seluruh halaman memakai komponen di berkas ini sehingga tidak ada satu pun
 * halaman yang menulis ulang pembungkus label, pesan error, atau kontrol
 * react-hook-form (DRY). Setiap field menerima `control` dari `useForm`.
 */

/** Nilai khusus untuk mengosongkan pilihan filter/select (Radix Select
 *  tidak mengizinkan item dengan nilai string kosong). */
export const NILAI_SEMUA = "semua";

export type OpsiSelect = { nilai: string; label: string };

interface PropsDasar<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  deskripsi?: string;
  wajib?: boolean;
  className?: string;
}

/** Pembungkus label + kontrol + pesan error. */
export function FormField({
  label,
  htmlFor,
  children,
  error,
  deskripsi,
  wajib,
  className,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  error?: string;
  deskripsi?: string;
  wajib?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {wajib ? (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {deskripsi && !error ? <p className="text-xs text-ink-muted">{deskripsi}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

/** Pengelompokan field dengan judul bagian, dipakai seluruh formulir panjang. */
export function KelompokField({
  judul,
  deskripsi,
  kolom = 1,
  className,
  children,
}: {
  judul: string;
  deskripsi?: string;
  kolom?: 1 | 2;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className={cn("flex flex-col gap-5", className)}>
      <legend className="flex flex-col gap-1 border-b border-divider pb-3">
        <span className="text-sm font-semibold text-ink">{judul}</span>
        {deskripsi ? <span className="text-xs text-ink-muted">{deskripsi}</span> : null}
      </legend>
      <div className={cn("grid gap-5", kolom === 2 && "sm:grid-cols-2")}>{children}</div>
    </fieldset>
  );
}

type PropsInput = Omit<
  React.ComponentProps<typeof Input>,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref" | "id"
>;

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  deskripsi,
  wajib,
  className,
  ...input
}: PropsDasar<T> & PropsInput) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          htmlFor={name}
          error={fieldState.error?.message}
          deskripsi={deskripsi}
          wajib={wajib}
          className={className}
        >
          <Input
            id={name}
            {...input}
            {...field}
            value={field.value ?? ""}
            aria-invalid={Boolean(fieldState.error)}
          />
        </FormField>
      )}
    />
  );
}

type PropsTextarea = Omit<
  React.ComponentProps<typeof Textarea>,
  "name" | "value" | "defaultValue" | "onChange" | "onBlur" | "ref" | "id"
>;

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  deskripsi,
  wajib,
  className,
  ...textarea
}: PropsDasar<T> & PropsTextarea) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          htmlFor={name}
          error={fieldState.error?.message}
          deskripsi={deskripsi}
          wajib={wajib}
          className={className}
        >
          <Textarea
            id={name}
            {...textarea}
            {...field}
            value={field.value ?? ""}
            aria-invalid={Boolean(fieldState.error)}
          />
        </FormField>
      )}
    />
  );
}

export function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  deskripsi,
  wajib,
  className,
  placeholder,
  autoComplete = "current-password",
}: Omit<PropsDasar<T>, "wajib"> & {
  wajib?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [lihat, setLihat] = React.useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          htmlFor={name}
          error={fieldState.error?.message}
          deskripsi={deskripsi}
          wajib={wajib}
          className={className}
        >
          <div className="relative">
            <Input
              id={name}
              type={lihat ? "text" : "password"}
              autoComplete={autoComplete}
              placeholder={placeholder}
              className="pr-12"
              aria-invalid={Boolean(fieldState.error)}
              {...field}
              value={field.value ?? ""}
            />
            <button
              type="button"
              onClick={() => setLihat((nilai) => !nilai)}
              aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-field text-ink-subtle transition-colors duration-150 ease-out hover:text-ink"
            >
              {lihat ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </FormField>
      )}
    />
  );
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  opsi,
  placeholder = "Pilih...",
  deskripsi,
  wajib,
  className,
  disabled,
  kosongkanLabel,
}: PropsDasar<T> & {
  opsi: readonly OpsiSelect[];
  placeholder?: string;
  disabled?: boolean;
  /** Bila diisi, tambahkan opsi pertama untuk mengosongkan pilihan. */
  kosongkanLabel?: string;
}) {
  const daftarOpsi = React.useMemo<OpsiSelect[]>(
    () =>
      kosongkanLabel ? [{ nilai: NILAI_SEMUA, label: kosongkanLabel }, ...opsi] : [...opsi],
    [kosongkanLabel, opsi],
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          htmlFor={name}
          error={fieldState.error?.message}
          deskripsi={deskripsi}
          wajib={wajib}
          className={className}
        >
          <Select
            value={field.value ? String(field.value) : undefined}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger id={name} aria-invalid={Boolean(fieldState.error)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {daftarOpsi.map((item) => (
                <SelectItem key={item.nilai} value={item.nilai}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}
    />
  );
}

export function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  deskripsi,
  className,
  disabled,
}: Omit<PropsDasar<T>, "wajib"> & { disabled?: boolean }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("flex flex-col gap-1.5", className)}>
          <label className="flex items-start gap-2.5 text-[13px] text-ink">
            <Checkbox
              className="mt-0.5"
              disabled={disabled}
              checked={Boolean(field.value)}
              onCheckedChange={(nilai) => field.onChange(nilai === true)}
              aria-invalid={Boolean(fieldState.error)}
            />
            <span className="flex flex-col">
              {label}
              {deskripsi ? <span className="text-xs text-ink-muted">{deskripsi}</span> : null}
            </span>
          </label>
          {fieldState.error ? (
            <p className="text-xs text-danger">{fieldState.error.message}</p>
          ) : null}
        </div>
      )}
    />
  );
}
