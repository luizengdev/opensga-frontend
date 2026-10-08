import {formatPeriodoLetivo} from "@/lib/academic/periodo-letivo";
import type {Aluno, DiarioClasse, Matricula, Turma} from "@/lib/api/fetch-generated";

export const normalizeBuscaAluno = (valor: string) => {
  return valor
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[.\-\/\s]/g, "");
};

export const matriculaCombinaBusca = (matricula: Matricula, termo: string) => {
  const consulta = normalizeBuscaAluno(termo);

  if (!consulta) {
    return false;
  }

  return (
    normalizeBuscaAluno(matricula.aluno.ra).includes(consulta) ||
    normalizeBuscaAluno(matricula.aluno.user.nome).includes(consulta) ||
    normalizeBuscaAluno(matricula.aluno.user.cpf).includes(consulta)
  );
};

export const labelSemestreIngresso = (semestreIngresso: string) => {
  const [ano, semestre] = semestreIngresso.split(".");

  if (!ano || (semestre !== "1" && semestre !== "2")) {
    return semestreIngresso;
  }

  return `${semestre === "1" ? "1º" : "2º"} semestre de ${ano}`;
};

export const alunoDaMatricula = (alunos: Aluno[], matricula: Matricula) => {
  return alunos.find((aluno) => aluno.ra === matricula.aluno.ra) ?? null;
};

export const diariosDaMatricula = (diarios: DiarioClasse[], matriculaId: string) => {
  return diarios.filter((diario) => diario.matriculaId === matriculaId);
};

export const turmaDoDiario = (turmas: Turma[], diario: DiarioClasse) => {
  return turmas.find((turma) => turma.id === diario.turma.id) ?? null;
};

export const periodosDosDiarios = (diarios: DiarioClasse[], turmas: Turma[]) => {
  const periodos = diarios
    .map((diario) => turmaDoDiario(turmas, diario))
    .filter((turma): turma is Turma => Boolean(turma))
    .map((turma) => formatPeriodoLetivo(turma));

  return [...new Set(periodos)].sort((a, b) => b.localeCompare(a));
};

export const diariosDoPeriodo = ({
  diarios,
  turmas,
  periodo,
}: {
  diarios: DiarioClasse[];
  turmas: Turma[];
  periodo: string;
}) => {
  return diarios.filter((diario) => {
    const turma = turmaDoDiario(turmas, diario);
    return turma ? formatPeriodoLetivo(turma) === periodo : false;
  });
};
