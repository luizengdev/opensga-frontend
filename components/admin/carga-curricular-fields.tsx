"use client";

import type {Control, FieldValues, Path} from "react-hook-form";

import {AdminSelect} from "@/components/admin/admin-select";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {TIPO_COMPONENTE_LABEL, TIPO_ENTREGA_LABEL} from "@/lib/admin/labels";
import type {TipoComponente, TipoEntrega} from "@/lib/api/fetch-generated";

const tiposComponente: TipoComponente[] = [
  "CORE_VIDA_CARREIRA",
  "ESPECIFICO",
  "ELETIVA_TRILHA",
  "EXTENSAO",
  "OPTATIVO",
];

const tiposEntrega: TipoEntrega[] = [
  "PRESENCIAL_FISICO",
  "SINCRONO_MEDIADO",
  "ASSINCRONO_DIGITAL",
];

export interface CargaCurricularFormValues {
  tipo: TipoComponente;
  tipoEntrega: TipoEntrega;
  chTotal: number;
  chPresencial: number;
  chSincrona: number;
  chAssincrona: number;
  chExtensao: number;
}

interface CargaCurricularFieldsProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  onChTotalChange?: (chTotal: number) => void;
}

export const CargaCurricularFields = <TFieldValues extends FieldValues>({
  control,
  onChTotalChange,
}: CargaCurricularFieldsProps<TFieldValues>) => {
  return (
    <>
      <FormField
        control={control}
        name={"chTotal" as Path<TFieldValues>}
        render={({field}) => (
          <FormItem>
            <FormLabel>CH total</FormLabel>
            <FormControl>
              <Input
                min={10}
                onBlur={field.onBlur}
                onChange={(event) => {
                  const chTotal = event.target.valueAsNumber;
                  field.onChange(chTotal);
                  if (!Number.isNaN(chTotal)) {
                    onChTotalChange?.(chTotal);
                  }
                }}
                ref={field.ref}
                type="number"
                value={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-3 gap-3">
        <FormField
          control={control}
          name={"chPresencial" as Path<TFieldValues>}
          render={({field}) => (
            <FormItem>
              <FormLabel>CH presencial</FormLabel>
              <FormControl>
                <Input
                  min={0}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.valueAsNumber)}
                  ref={field.ref}
                  type="number"
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={"chSincrona" as Path<TFieldValues>}
          render={({field}) => (
            <FormItem>
              <FormLabel>CH síncrona</FormLabel>
              <FormControl>
                <Input
                  min={0}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.valueAsNumber)}
                  ref={field.ref}
                  type="number"
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={"chAssincrona" as Path<TFieldValues>}
          render={({field}) => (
            <FormItem>
              <FormLabel>CH assíncrona</FormLabel>
              <FormControl>
                <Input
                  min={0}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.valueAsNumber)}
                  ref={field.ref}
                  type="number"
                  value={field.value}
                />
              </FormControl>
              <FormDescription className="text-[11px]">Soma = CH total</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name={"tipo" as Path<TFieldValues>}
        render={({field}) => (
          <FormItem>
            <FormLabel>Tipo</FormLabel>
            <FormControl>
              <AdminSelect
                items={tiposComponente.map((item) => ({
                  value: item,
                  label: TIPO_COMPONENTE_LABEL[item],
                }))}
                onValueChange={field.onChange}
                value={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={"tipoEntrega" as Path<TFieldValues>}
        render={({field}) => (
          <FormItem>
            <FormLabel>Tipo de entrega</FormLabel>
            <FormControl>
              <AdminSelect
                items={tiposEntrega.map((item) => ({
                  value: item,
                  label: TIPO_ENTREGA_LABEL[item],
                }))}
                onValueChange={field.onChange}
                value={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={"chExtensao" as Path<TFieldValues>}
        render={({field}) => (
          <FormItem>
            <FormLabel>CH extensão</FormLabel>
            <FormControl>
              <Input
                min={0}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(event.target.valueAsNumber)}
                ref={field.ref}
                type="number"
                value={field.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
