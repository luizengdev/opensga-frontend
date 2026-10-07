"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {Search} from "lucide-react";
import {useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";

import {AdminEmptyState} from "@/components/admin/admin-empty-state";
import {AdminPageHeader} from "@/components/admin/admin-page-header";
import {AdminSelect} from "@/components/admin/admin-select";
import {ConsultaAcademicaInfoField} from "@/components/admin/consulta-academica-info-field";
import {StatusFaturaBadge} from "@/components/admin/status-fatura-badge";
import {StatusMatriculaBadge} from "@/components/admin/status-matricula-badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {formatPeriodoLetivo} from "@/lib/academic/periodo-letivo";
import {
  alunoDaMatricula,
  diariosDaMatricula,
  diariosDoPeriodo,
  labelSemestreIngresso,
  matriculaCombinaBusca,
  periodosDosDiarios,
  turmaDoDiario,
} from "@/lib/admin/consulta-academica";
import {formatCurrencyBrl, formatDateBr} from "@/lib/admin/format";
import {MODALIDADE_LABEL, STATUS_MATRICULA_LABEL, TIPO_ENTREGA_LABEL} from "@/lib/admin/labels";
import {formatNota} from "@/lib/aluno/disciplina";
import {STATUS_DISCIPLINA_LABEL} from "@/lib/aluno/labels";
import type {
  Aluno,
  Campus,
  Curso,
  DiarioClasse,
  Fatura,
  Matricula,
  Turma,
} from "@/lib/api/fetch-generated";
import {
  useGetAlunos,
  useGetCampi,
  useGetCursos,
  useGetDiarios,
  useGetFaturas,
  useGetMatriculas,
  useGetTurmas,
} from "@/lib/api/rc-generated";

const buscaSchema = z.object({
  termo: z.string().trim().min(2, "Informe ao menos 2 caracteres de RA, nome ou CPF."),
});

type BuscaFormValues = z.infer<typeof buscaSchema>;

interface ConsultaAcademicaViewProps {
  initialAlunos: Aluno[];
  initialCampi: Campus[];
  initialCursos: Curso[];
  initialDiarios: DiarioClasse[];
  initialFaturas: Fatura[];
  initialMatriculas: Matricula[];
  initialTurmas: Turma[];
}

export const ConsultaAcademicaView = ({
  initialAlunos,
  initialCampi,
  initialCursos,
  initialDiarios,
  initialFaturas,
  initialMatriculas,
  initialTurmas,
}: ConsultaAcademicaViewProps) => {
  const {data: matriculas} = useGetMatriculas({initialData: initialMatriculas});
  const {data: alunos} = useGetAlunos({initialData: initialAlunos});
  const {data: cursos} = useGetCursos({initialData: initialCursos});
  const {data: campi} = useGetCampi({initialData: initialCampi});
  const {data: turmas} = useGetTurmas({initialData: initialTurmas});
  const {data: diarios} = useGetDiarios({initialData: initialDiarios});
  const {data: faturas} = useGetFaturas({initialData: initialFaturas});

  const listaMatriculas = matriculas ?? initialMatriculas;
  const listaAlunos = alunos ?? initialAlunos;
  const listaCursos = cursos ?? initialCursos;
  const listaCampi = campi ?? initialCampi;
  const listaTurmas = turmas ?? initialTurmas;
  const listaDiarios = diarios ?? initialDiarios;
  const listaFaturas = faturas ?? initialFaturas;

  const [resultados, setResultados] = useState<Matricula[]>([]);
  const [buscou, setBuscou] = useState(false);
  const [matriculaId, setMatriculaId] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState("");

  const form = useForm<BuscaFormValues>({
    resolver: zodResolver(buscaSchema),
    defaultValues: {termo: ""},
  });

  const matricula = listaMatriculas.find((item) => item.id === matriculaId) ?? null;
  const aluno = matricula ? alunoDaMatricula(listaAlunos, matricula) : null;
  const curso = matricula
    ? (listaCursos.find((item) => item.id === matricula.curso.id) ?? null)
    : null;
  const campus = curso ? (listaCampi.find((item) => item.id === curso.campusId) ?? null) : null;
  const diariosAluno = matricula ? diariosDaMatricula(listaDiarios, matricula.id) : [];
  const periodos = periodosDosDiarios(diariosAluno, listaTurmas);
  const periodoAtivo = periodo && periodos.includes(periodo) ? periodo : (periodos[0] ?? "");
  const diariosPeriodo = diariosDoPeriodo({
    diarios: diariosAluno,
    turmas: listaTurmas,
    periodo: periodoAtivo,
  });
  const faturasAluno = matricula
    ? listaFaturas.filter((fatura) => fatura.aluno.ra === matricula.aluno.ra)
    : [];

  const chIntegralizada = useMemo(() => {
    return diariosAluno
      .filter((diario) => diario.statusDisciplina === "APROVADO")
      .reduce((acc, diario) => acc + diario.chCumprida, 0);
  }, [diariosAluno]);

  const onSubmit = form.handleSubmit((payload) => {
    const encontrados = listaMatriculas.filter((item) => matriculaCombinaBusca(item, payload.termo));
    setBuscou(true);
    setResultados(encontrados);

    if (encontrados.length === 1) {
      setMatriculaId(encontrados[0].id);
      setPeriodo("");
      return;
    }

    setMatriculaId(null);
    setPeriodo("");
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        description="Localize o discente por RA, nome ou CPF e visualize o dossiê acadêmico completo."
        eyebrow="Secretaria acadêmica"
        title="Consulta acadêmica do aluno"
        actions={
          <Form {...form}>
            <form className="w-full min-w-[18rem] sm:w-[28rem]" onSubmit={onSubmit}>
              <FormField
                control={form.control}
                name="termo"
                render={({field}) => (
                  <FormItem>
                    <FormControl>
                      <InputGroup className="h-9">
                        <InputGroupAddon>
                          <Search className="size-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          autoComplete="off"
                          placeholder="Buscar por RA, nome ou CPF"
                          {...field}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton size="xs" type="submit" variant="secondary">
                            Buscar
                          </InputGroupButton>
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        }
      />

      {!matricula ? (
        <Card>
          <CardContent>
            {!buscou ? (
              <AdminEmptyState
                description="Informe RA, nome ou CPF no campo acima para abrir o dossiê do aluno."
                icon={Search}
                title="Nenhum aluno selecionado"
              />
            ) : resultados.length === 0 ? (
              <AdminEmptyState
                description="Nenhum vínculo acadêmico corresponde aos dados informados."
                icon={Search}
                title="Nenhum resultado"
              />
            ) : (
              <div className="space-y-2 py-2">
                <p className="text-xs text-muted-foreground">
                  {resultados.length} vínculos encontrados. Selecione o aluno para abrir o dossiê.
                </p>
                {resultados.map((item) => (
                  <Button
                    className="h-auto w-full justify-between px-3 py-2.5"
                    key={item.id}
                    onClick={() => {
                      setMatriculaId(item.id);
                      setPeriodo("");
                    }}
                    type="button"
                    variant="outline"
                  >
                    <span className="truncate text-left text-xs font-medium">
                      {item.aluno.user.nome}
                      <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                        RA {item.aluno.ra}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      {item.curso.nome}
                      <StatusMatriculaBadge status={item.status} />
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{matricula.aluno.user.nome}</CardTitle>
                <CardDescription>
                  RA {matricula.aluno.ra} · CPF {matricula.aluno.user.cpf}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <StatusMatriculaBadge status={matricula.status} />
                <Button
                  onClick={() => setMatriculaId(null)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Nova consulta
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ConsultaAcademicaInfoField
                label="Curso"
                value={`${matricula.curso.nome} · ${MODALIDADE_LABEL[matricula.curso.modalidade]}`}
              />
              <ConsultaAcademicaInfoField label="Campus / polo" value={campus?.nome ?? "—"} />
              <ConsultaAcademicaInfoField
                label="Matriz curricular"
                value={matricula.matrizCurricular.nome}
              />
              <ConsultaAcademicaInfoField
                label="Semestre de ingresso"
                value={labelSemestreIngresso(matricula.semestreIngresso)}
              />
              <ConsultaAcademicaInfoField
                label="Período atual"
                value={`${matricula.periodoAtual}º período`}
              />
              <ConsultaAcademicaInfoField
                label="Situação"
                value={STATUS_MATRICULA_LABEL[matricula.status]}
              />
              <ConsultaAcademicaInfoField
                label="Data de ingresso"
                value={labelSemestreIngresso(matricula.semestreIngresso)}
              />
              <ConsultaAcademicaInfoField
                label="Data do vestibular"
                value="Não informado no cadastro"
              />
              <ConsultaAcademicaInfoField label="CH integralizada" value={`${chIntegralizada}h`} />
            </CardContent>
          </Card>

          <Tabs defaultValue="pessoais">
            <TabsList className="h-auto w-full flex-wrap">
              <TabsTrigger className="text-xs" value="pessoais">
                Dados pessoais
              </TabsTrigger>
              <TabsTrigger className="text-xs" value="academicos">
                Dados acadêmicos
              </TabsTrigger>
              <TabsTrigger className="text-xs" value="horarios">
                Horários
              </TabsTrigger>
              <TabsTrigger className="text-xs" value="historico">
                Histórico
              </TabsTrigger>
              <TabsTrigger className="text-xs" value="aproveitamento">
                Aproveitamento
              </TabsTrigger>
              <TabsTrigger className="text-xs" value="financeiro">
                Financeiro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pessoais">
              <Card>
                <CardHeader>
                  <CardTitle>Cadastro do discente</CardTitle>
                  <CardDescription>Dados pessoais e de contato registrados na secretaria.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <ConsultaAcademicaInfoField label="Nome completo" value={matricula.aluno.user.nome} />
                  <ConsultaAcademicaInfoField label="RA" value={matricula.aluno.ra} />
                  <ConsultaAcademicaInfoField label="CPF" value={matricula.aluno.user.cpf} />
                  <ConsultaAcademicaInfoField
                    label="E-mail institucional"
                    value={matricula.aluno.user.email}
                  />
                  <ConsultaAcademicaInfoField
                    label="Telefone"
                    value={aluno?.user.telefone?.trim() ? aluno.user.telefone : "Não informado"}
                  />
                  <ConsultaAcademicaInfoField
                    label="Data de nascimento"
                    value={aluno?.dataNascimento ? formatDateBr(aluno.dataNascimento) : "—"}
                  />
                  <ConsultaAcademicaInfoField
                    label="Conta do portal"
                    value={matricula.aluno.user.ativo ? "Ativa" : "Inativa"}
                  />
                  <ConsultaAcademicaInfoField
                    label="Responsável"
                    value={aluno?.responsavelId ? "Vinculado" : "Sem responsável cadastrado"}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academicos">
              <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Notas e faltas do semestre</CardTitle>
                    <CardDescription>
                      Selecione o período letivo para ver o boletim daquele semestre.
                    </CardDescription>
                  </div>
                  <div className="w-full sm:w-48">
                    <AdminSelect
                      disabled={periodos.length === 0}
                      items={periodos.map((item) => ({value: item, label: item}))}
                      onValueChange={setPeriodo}
                      placeholder="Semestre"
                      value={periodoAtivo}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {diariosPeriodo.length === 0 ? (
                    <AdminEmptyState
                      description="Este aluno não possui diários no período selecionado."
                      icon={Search}
                      title="Sem lançamentos no semestre"
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Disciplina</TableHead>
                          <TableHead>AV</TableHead>
                          <TableHead>AVS</TableHead>
                          <TableHead>AV3</TableHead>
                          <TableHead>NS</TableHead>
                          <TableHead>MF</TableHead>
                          <TableHead>Faltas</TableHead>
                          <TableHead>Situação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {diariosPeriodo.map((diario) => (
                          <TableRow key={diario.id}>
                            <TableCell>
                              <div className="font-medium">{diario.turma.disciplina.nome}</div>
                              <div className="font-mono text-[10px] text-muted-foreground">
                                {diario.turma.codigo}
                              </div>
                            </TableCell>
                            <TableCell className="font-mono tabular-nums">
                              {formatNota(diario.notaAv)}
                            </TableCell>
                            <TableCell className="font-mono tabular-nums">
                              {formatNota(diario.notaAvs)}
                            </TableCell>
                            <TableCell className="font-mono tabular-nums">
                              {formatNota(diario.notaAv3)}
                            </TableCell>
                            <TableCell className="font-mono tabular-nums">
                              {formatNota(diario.notaSemestral)}
                            </TableCell>
                            <TableCell className="font-mono tabular-nums">
                              {formatNota(diario.mediaFinal)}
                            </TableCell>
                            <TableCell className="font-mono tabular-nums">
                              {diario.totalFaltas}/{diario.chTotal}
                            </TableCell>
                            <TableCell>{STATUS_DISCIPLINA_LABEL[diario.statusDisciplina]}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="horarios">
              <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Grade horária</CardTitle>
                    <CardDescription>
                      Ofertas do período {periodoAtivo || "—"} com professor titular.
                    </CardDescription>
                  </div>
                  <div className="w-full sm:w-48">
                    <AdminSelect
                      disabled={periodos.length === 0}
                      items={periodos.map((item) => ({value: item, label: item}))}
                      onValueChange={setPeriodo}
                      placeholder="Semestre"
                      value={periodoAtivo}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {diariosPeriodo.length === 0 ? (
                    <AdminEmptyState
                      description="Não há turmas com horário para o semestre selecionado."
                      icon={Search}
                      title="Sem grade no período"
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Disciplina</TableHead>
                          <TableHead>Professor</TableHead>
                          <TableHead>Horário</TableHead>
                          <TableHead>Local</TableHead>
                          <TableHead>Entrega</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {diariosPeriodo.map((diario) => {
                          const turma = turmaDoDiario(listaTurmas, diario);

                          return (
                            <TableRow key={diario.id}>
                              <TableCell>
                                <div className="font-medium">{diario.turma.disciplina.nome}</div>
                                <div className="font-mono text-[10px] text-muted-foreground">
                                  {diario.turma.codigo}
                                </div>
                              </TableCell>
                              <TableCell>{turma?.professor.user.nome ?? "—"}</TableCell>
                              <TableCell className="font-mono text-xs">
                                {turma?.horario ?? "—"}
                              </TableCell>
                              <TableCell className="text-xs">{turma?.salaOuLink ?? "A definir"}</TableCell>
                              <TableCell className="text-xs">
                                {turma ? TIPO_ENTREGA_LABEL[turma.tipoEntrega] : "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historico">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico curricular</CardTitle>
                  <CardDescription>
                    Todas as disciplinas já enturmadas neste vínculo, em qualquer período.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {diariosAluno.length === 0 ? (
                    <AdminEmptyState
                      description="Ainda não há diários de classe neste vínculo."
                      icon={Search}
                      title="Histórico vazio"
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Período</TableHead>
                          <TableHead>Disciplina</TableHead>
                          <TableHead>MF</TableHead>
                          <TableHead>Faltas</TableHead>
                          <TableHead>CH</TableHead>
                          <TableHead>Situação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {diariosAluno.map((diario) => {
                          const turma = turmaDoDiario(listaTurmas, diario);

                          return (
                            <TableRow key={diario.id}>
                              <TableCell className="font-mono text-xs">
                                {turma ? formatPeriodoLetivo(turma) : "—"}
                              </TableCell>
                              <TableCell>{diario.turma.disciplina.nome}</TableCell>
                              <TableCell className="font-mono tabular-nums">
                                {formatNota(diario.mediaFinal ?? diario.notaSemestral)}
                              </TableCell>
                              <TableCell className="font-mono tabular-nums">
                                {diario.totalFaltas}
                              </TableCell>
                              <TableCell className="font-mono tabular-nums">
                                {diario.chCumprida}/{diario.chTotal}
                              </TableCell>
                              <TableCell>{STATUS_DISCIPLINA_LABEL[diario.statusDisciplina]}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aproveitamento">
              <Card>
                <CardHeader>
                  <CardTitle>Aproveitamento de estudos</CardTitle>
                  <CardDescription>
                    Disciplinas dispensadas ou aproveitadas neste vínculo acadêmico.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminEmptyState
                    description="O OpenSGA ainda não registra aproveitamento ou dispensa de disciplinas. Quando o fluxo existir, a lista aparecerá nesta aba."
                    icon={Search}
                    title="Nenhum aproveitamento lançado"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financeiro">
              <Card>
                <CardHeader>
                  <CardTitle>Faturas do aluno</CardTitle>
                  <CardDescription>Mensalidades e cobranças vinculadas ao RA.</CardDescription>
                </CardHeader>
                <CardContent>
                  {faturasAluno.length === 0 ? (
                    <AdminEmptyState
                      description="Não há faturas registradas para este aluno."
                      icon={Search}
                      title="Sem lançamentos financeiros"
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Situação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {faturasAluno.map((fatura) => (
                          <TableRow key={fatura.id}>
                            <TableCell>{fatura.descricao}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {formatDateBr(fatura.dataVencimento)}
                            </TableCell>
                            <TableCell className="font-mono tabular-nums">
                              {formatCurrencyBrl(fatura.valor)}
                            </TableCell>
                            <TableCell>
                              <StatusFaturaBadge status={fatura.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
