"use client";

import {GraduationCap, Search, Trash2} from "lucide-react";
import {useMemo, useState} from "react";

import {InscricaoCourseCard} from "@/components/public/inscricao-course-card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {CatalogoCurso, CatalogoModalidade} from "@/lib/api/fetch-generated";
import {
  emptyCatalogoFilters,
  filterCatalogo,
  formatDuracaoMeses,
  getModalidadeLabel,
  getTipoGraduacaoLabel,
  listAvailableModalidades,
  listCidades,
  listDuracoes,
  listEstados,
  listTiposGraduacao,
  resolveCatalogCourseId,
  TIPO_GRADUACAO_LABEL,
  type CatalogoFilters,
  type CatalogoTipoGraduacao,
} from "@/lib/public/catalog";

interface InscricaoCatalogProps {
  catalogo: CatalogoCurso[];
  initialCourseHint?: string;
}

const toSelectItems = (options: Array<{label: string; value: string | null}>) => {
  return options;
};

export const InscricaoCatalog = ({
  catalogo,
  initialCourseHint,
}: InscricaoCatalogProps) => {
  const hintedName = catalogo.find(
    (curso) => curso.cursoId === resolveCatalogCourseId(catalogo, initialCourseHint),
  )?.nome;

  const [filters, setFilters] = useState<CatalogoFilters>(() => ({
    ...emptyCatalogoFilters(),
    search: hintedName ?? "",
  }));

  const estados = listEstados(catalogo);
  const cidades = listCidades(catalogo, filters.estado);
  const tipos = listTiposGraduacao(catalogo) as CatalogoTipoGraduacao[];
  const duracoes = listDuracoes(catalogo);
  const modalidades = listAvailableModalidades(catalogo);

  const cursos = useMemo(() => {
    return filterCatalogo(catalogo, filters);
  }, [catalogo, filters]);

  const activeChips = [
    {key: "nivel", label: "Graduação", clearable: false},
    filters.estado
      ? {key: "estado", label: filters.estado, clearable: true}
      : null,
    filters.cidade
      ? {key: "cidade", label: filters.cidade, clearable: true}
      : null,
    filters.tipoGraduacao
      ? {
          key: "tipo",
          label: getTipoGraduacaoLabel(
            filters.tipoGraduacao as CatalogoTipoGraduacao,
          ),
          clearable: true,
        }
      : null,
    filters.duracaoSemestres
      ? {
          key: "duracao",
          label: formatDuracaoMeses(Number(filters.duracaoSemestres)),
          clearable: true,
        }
      : null,
  ].filter((chip) => chip !== null);

  const updateFilter = <Key extends keyof CatalogoFilters>(
    key: Key,
    value: CatalogoFilters[Key],
  ) => {
    setFilters((current) => {
      const next = {...current, [key]: value};

      if (key === "estado") {
        next.cidade = "";
      }

      return next;
    });
  };

  const clearFilters = () => {
    setFilters(emptyCatalogoFilters());
  };

  const estadoItems = toSelectItems([
    {label: "Estado", value: null},
    ...estados.map((estado) => ({label: estado, value: estado})),
  ]);
  const cidadeItems = toSelectItems([
    {label: "Cidade", value: null},
    ...cidades.map((cidade) => ({label: cidade, value: cidade})),
  ]);
  const tipoItems = toSelectItems([
    {label: "Tipo de Curso", value: null},
    ...tipos.map((tipo) => ({
      label: TIPO_GRADUACAO_LABEL[tipo],
      value: tipo,
    })),
  ]);
  const duracaoItems = toSelectItems([
    {label: "Duração", value: null},
    ...duracoes.map((duracao) => ({
      label: formatDuracaoMeses(duracao),
      value: String(duracao),
    })),
  ]);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h1 className="text-center font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Cursos de Graduação da Nexa
        </h1>
        <div className="flex flex-wrap justify-center gap-2">
          <Button className="rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700">
            <GraduationCap />
            Graduação
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled
            className="rounded-full border-slate-200 bg-white text-slate-400"
          >
            Pós-graduação
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled
            className="rounded-full border-slate-200 bg-white text-slate-400"
          >
            Técnico
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled
            className="rounded-full border-slate-200 bg-white text-slate-400"
          >
            Profissionalizantes
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            items={estadoItems}
            value={filters.estado || null}
            onValueChange={(value) => updateFilter("estado", value ?? "")}
          >
            <SelectTrigger className="h-10 w-full rounded-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {estadoItems.map((item) => (
                  <SelectItem key={item.value ?? "estado"} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            items={cidadeItems}
            value={filters.cidade || null}
            onValueChange={(value) => updateFilter("cidade", value ?? "")}
            disabled={!filters.estado}
          >
            <SelectTrigger className="h-10 w-full rounded-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {cidadeItems.map((item) => (
                  <SelectItem key={item.value ?? "cidade"} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            items={tipoItems}
            value={filters.tipoGraduacao || null}
            onValueChange={(value) => updateFilter("tipoGraduacao", value ?? "")}
          >
            <SelectTrigger className="h-10 w-full rounded-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {tipoItems.map((item) => (
                  <SelectItem key={item.value ?? "tipo"} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            items={duracaoItems}
            value={filters.duracaoSemestres || null}
            onValueChange={(value) =>
              updateFilter("duracaoSemestres", value ?? "")
            }
          >
            <SelectTrigger className="h-10 w-full rounded-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {duracaoItems.map((item) => (
                  <SelectItem key={item.value ?? "duracao"} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-500 hover:text-slate-900"
            onClick={clearFilters}
          >
            <Trash2 />
            Limpar filtros
          </Button>
          {activeChips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="h-auto rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-blue-700"
            >
              {chip.label}
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-md">
            <p className="mb-1.5 text-xs font-medium text-slate-600">
              Pesquisar curso
            </p>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Pesquisar"
                className="h-10 rounded-full bg-white pl-9"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={filters.modalidade === "all" ? "default" : "outline"}
              className={
                filters.modalidade === "all"
                  ? "rounded-full bg-slate-900 text-white hover:bg-slate-800"
                  : "rounded-full"
              }
              onClick={() => updateFilter("modalidade", "all")}
            >
              Todos
            </Button>
            {modalidades.map((modalidade) => (
              <Button
                key={modalidade}
                type="button"
                size="sm"
                variant={
                  filters.modalidade === modalidade ? "default" : "outline"
                }
                className={
                  filters.modalidade === modalidade
                    ? "rounded-full bg-slate-900 text-white hover:bg-slate-800"
                    : "rounded-full"
                }
                onClick={() =>
                  updateFilter("modalidade", modalidade as CatalogoModalidade)
                }
              >
                {getModalidadeLabel(modalidade)}
              </Button>
            ))}
          </div>
        </div>
        {cursos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Nenhum curso com mensalidade ativa para os filtros selecionados.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cursos.map((curso) => (
              <InscricaoCourseCard key={curso.cursoId} curso={curso} />
            ))}
          </div>
        )}
        <p className="text-center text-xs text-slate-500">
          {`Mostrando ${cursos.length} de ${catalogo.length} cursos`}
        </p>
      </div>
    </div>
  );
};
