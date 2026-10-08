import {formatNota} from "@/lib/aluno/disciplina";
import type {TermoAbertura, TermoDiarioResumo} from "@/lib/api/fetch-generated";

export const describeTermoAlvo = (termo: TermoAbertura) => {
  if (termo.tipo === "TURMA" && termo.turma) {
    return `${termo.turma.codigo} · ${termo.turma.disciplina.nome}`;
  }

  if (termo.diario) {
    return `${termo.diario.aluno.ra} · ${termo.diario.aluno.nome} · ${termo.diario.turma.codigo}`;
  }

  return "—";
};

export const describeTermoCurso = (termo: TermoAbertura) => {
  if (termo.tipo === "TURMA" && termo.turma) {
    return termo.turma.curso.nome;
  }

  if (termo.diario) {
    return termo.diario.turma.curso.nome;
  }

  return "—";
};

export const describeTermoAlteracao = (termo: TermoAbertura) => {
  if (termo.tipo !== "INDIVIDUAL") {
    return "Reabertura da turma";
  }

  const partes = [
    termo.notaAv !== null ? `AV ${formatNota(termo.notaAv)}` : null,
    termo.notaAvs !== null ? `AVS ${formatNota(termo.notaAvs)}` : null,
    termo.notaAv3 !== null ? `AV3 ${formatNota(termo.notaAv3)}` : null,
    termo.totalFaltas !== null ? `Faltas ${termo.totalFaltas}` : null,
  ].filter((parte): parte is string => parte !== null);

  return partes.length > 0 ? partes.join(" · ") : "—";
};

export const countTermosPorStatus = (termos: TermoAbertura[]) => {
  return termos.reduce(
    (acc, termo) => {
      acc[termo.status] += 1;
      return acc;
    },
    {PENDENTE: 0, APROVADO: 0, RECUSADO: 0},
  );
};

export const describeDiarioAluno = (diario: TermoDiarioResumo) => {
  return `${diario.aluno.ra} · ${diario.aluno.nome}`;
};
