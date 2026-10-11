import http from "node:http";

const PORT = Number(process.env.MOCK_API_PORT ?? 3334);

const IDS = {
  campus: "00000000-0000-4000-8000-0000000000c1",
  curso: "00000000-0000-4000-8000-0000000000c2",
  disciplina: "00000000-0000-4000-8000-0000000000d1",
  matrizOk: "00000000-0000-4000-8000-0000000000m1",
  matrizBaixa: "00000000-0000-4000-8000-0000000000m2",
  componente: "00000000-0000-4000-8000-0000000000k1",
  professor: "00000000-0000-4000-8000-0000000000p2",
  professorUser: "00000000-0000-4000-8000-0000000000p1",
  adminUser: "00000000-0000-4000-8000-0000000000a1",
  turma: "00000000-0000-4000-8000-0000000000t1",
  turmaOutra: "00000000-0000-4000-8000-0000000000t2",
  matricula: "00000000-0000-4000-8000-0000000000n1",
  diario: "00000000-0000-4000-8000-0000000000i1",
  alunoUser: "00000000-0000-4000-8000-0000000000u1",
};

const json = (res, status, body) => {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
};

const readBody = (req) =>
  new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        resolve({});
      }
    });
  });

const encodeJwt = (payload) => {
  const header = Buffer.from(JSON.stringify({alg: "none", typ: "JWT"})).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.e2e`;
};

const roleFromAuth = (req) => {
  const auth = req.headers.authorization ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"));
    return payload.role ?? "ADMIN";
  } catch {
    return "ADMIN";
  }
};

const adminUser = {
  id: IDS.adminUser,
  nome: "Admin E2E",
  email: "testeadmin@opensga.dev",
  cpf: "000.000.000-00",
  role: "ADMIN",
  avatarUrl: null,
};

const professorUser = {
  id: IDS.professorUser,
  nome: "Professor E2E",
  email: "professor@opensga.dev",
  cpf: "111.111.111-11",
  role: "PROFESSOR",
  avatarUrl: null,
};

const alunoUser = {
  id: IDS.alunoUser,
  nome: "Aluno E2E",
  email: "aluno@opensga.dev",
  cpf: "222.222.222-22",
  role: "ALUNO",
  avatarUrl: null,
};

const parametrizacoes = {
  id: "00000000-0000-4000-8000-000000000099",
  nomeIes: "OpenSGA E2E",
  siglaIes: "E2E",
  mantenedora: "Mantenedora E2E",
  cnpj: "00.000.000/0001-00",
  anoLetivo: 2026,
  semestreLetivo: 2,
  periodoAutomatico: true,
  corteAprovacaoDireta: 6,
  corteMediaFinal: 5,
  limiteFaltasPercentual: 25,
  percentualMinimoExtensao: 10,
  atualizadoEm: new Date().toISOString(),
};

const campus = {
  id: IDS.campus,
  nome: "Sede Recife",
  codigoPolo: "SEDE-REC",
  tipo: "CAMPI",
  cidade: "Recife",
  estado: "PE",
  endereco: "Rua da Sede, 1",
};

const curso = {
  id: IDS.curso,
  campusId: IDS.campus,
  nome: "Engenharia de Software",
  codigoMec: "ESW-E2E",
  modalidade: "PRESENCIAL",
  duracaoSemestres: 8,
};

const disciplina = {
  id: IDS.disciplina,
  nome: "Cálculo I",
  codigo: "CALC1",
  tipo: "ESPECIFICO",
  tipoEntrega: "PRESENCIAL_FISICO",
  chTotal: 60,
  chPresencial: 42,
  chSincrona: 9,
  chAssincrona: 9,
  chExtensao: 0,
};

const disciplinaExt = {
  id: "00000000-0000-4000-8000-0000000000d2",
  nome: "Projeto de Extensão",
  codigo: "EXT1",
  tipo: "EXTENSAO",
  tipoEntrega: "PRESENCIAL_FISICO",
  chTotal: 80,
  chPresencial: 56,
  chSincrona: 12,
  chAssincrona: 12,
  chExtensao: 80,
};

const matrizes = [
  {
    id: IDS.matrizOk,
    cursoId: IDS.curso,
    nome: "Matriz 2026.1 Conforme",
    anoVigencia: 2026,
    ativo: true,
  },
  {
    id: IDS.matrizBaixa,
    cursoId: IDS.curso,
    nome: "Matriz Extensão Baixa",
    anoVigencia: 2025,
    ativo: true,
  },
];

const componentesOk = [
  {
    id: IDS.componente,
    matrizCurricularId: IDS.matrizOk,
    disciplinaId: IDS.disciplina,
    semestreIdeal: 1,
    tipo: "ESPECIFICO",
    tipoEntrega: "PRESENCIAL_FISICO",
    chTotal: 60,
    chPresencial: 42,
    chSincrona: 9,
    chAssincrona: 9,
    chExtensao: 0,
    disciplina: {id: disciplina.id, nome: disciplina.nome, codigo: disciplina.codigo},
  },
  {
    id: "00000000-0000-4000-8000-0000000000k2",
    matrizCurricularId: IDS.matrizOk,
    disciplinaId: disciplinaExt.id,
    semestreIdeal: 2,
    tipo: "EXTENSAO",
    tipoEntrega: "PRESENCIAL_FISICO",
    chTotal: 80,
    chPresencial: 56,
    chSincrona: 12,
    chAssincrona: 12,
    chExtensao: 80,
    disciplina: {id: disciplinaExt.id, nome: disciplinaExt.nome, codigo: disciplinaExt.codigo},
  },
];

const auditoria = (matrizId, conforme) => ({
  matrizId,
  matrizNome: matrizes.find((m) => m.id === matrizId)?.nome ?? "Matriz",
  cursoNome: curso.nome,
  modalidadeCurso: "PRESENCIAL",
  campusId: campus.id,
  campusNome: campus.nome,
  codigoPolo: campus.codigoPolo,
  chTotalGeral: conforme ? 140 : 60,
  chExtensaoTotal: conforme ? 80 : 0,
  chExtensaoPorTipo: conforme ? 80 : 0,
  percentualExtensao: conforme ? 57.14 : 0,
  percentualMinimoExtensao: 10,
  cumpreRegra10PorcentoExtensao: conforme,
  chPresencialTotal: conforme ? 98 : 42,
  percentualPresencial: 70,
  chSincronaTotal: conforme ? 21 : 9,
  percentualSincrono: 15,
  chAssincronaTotal: conforme ? 21 : 9,
  percentualAssincrono: 15,
  percentualPresencialESincrono: 85,
  quantidadeComponentes: conforme ? 2 : 1,
  conformeDecreto12456: true,
  violacoes: conforme
    ? []
    : [{codigo: "EXTENSAO_10", mensagem: "Extensão abaixo de 10% da CH total."}],
});

const professorPerfil = {
  id: IDS.professor,
  matricula: "PROF-001",
  titulacao: "Mestre",
  departamento: "Computação",
  user: {
    id: IDS.professorUser,
    nome: professorUser.nome,
    email: professorUser.email,
  },
};

const turmaProfessor = {
  id: IDS.turma,
  campusId: IDS.campus,
  cursoId: IDS.curso,
  disciplinaId: IDS.disciplina,
  professorId: IDS.professor,
  codigo: "CALC1-2026.2",
  anoLetivo: 2026,
  semestreLetivo: 2,
  capacidade: 60,
  horario: "Seg 08:00-10:00",
  salaOuLink: "B-201",
  tipoEntrega: "PRESENCIAL_FISICO",
  curso: {id: curso.id, nome: curso.nome},
  disciplina: {id: disciplina.id, nome: disciplina.nome, codigo: disciplina.codigo},
  chTotal: 60,
  professor: professorPerfil,
  quantidadeDiarios: 1,
};

const turmaOutra = {
  ...turmaProfessor,
  id: IDS.turmaOutra,
  codigo: "CALC1-OUTRA",
  professorId: "00000000-0000-4000-8000-0000000000p9",
  professor: {
    id: "00000000-0000-4000-8000-0000000000p9",
    matricula: "PROF-999",
    titulacao: "Doutor",
    departamento: "Computação",
    user: {
      id: "00000000-0000-4000-8000-0000000000p8",
      nome: "Outro Professor",
      email: "outro@opensga.dev",
    },
  },
  quantidadeDiarios: 0,
};

const IDS_EXTRA = {
  matricula2: "00000000-0000-4000-8000-0000000000n2",
  matriculaFora: "00000000-0000-4000-8000-0000000000n3",
  diario2: "00000000-0000-4000-8000-0000000000i2",
  alunoUser2: "00000000-0000-4000-8000-0000000000u2",
};

const createMatricula = ({id, ra, nome, email, cpf}) => ({
  id,
  status: "ATIVO",
  periodoAtual: 1,
  semestreIngresso: "2026.1",
  curso: {id: curso.id, nome: curso.nome, modalidade: "PRESENCIAL"},
  matrizCurricular: {id: IDS.matrizOk, nome: "Matriz 2026.1 Conforme", anoVigencia: 2026},
  aluno: {
    ra,
    user: {
      id: id.replace("n", "u"),
      nome,
      email,
      cpf,
      ativo: true,
    },
  },
});

const createDiario = ({id, matriculaId, ra, nome}) => ({
  id,
  matriculaId,
  turmaId: IDS.turma,
  notaAv: null,
  notaAvs: null,
  notaAv3: null,
  notaSemestral: null,
  mediaFinal: null,
  habilitaAv3: false,
  totalFaltas: 0,
  chTotal: 60,
  chCumprida: 0,
  statusDisciplina: "EM_ABERTO",
  semestreFechado: false,
  turma: {
    id: IDS.turma,
    codigo: turmaProfessor.codigo,
    disciplina: {id: disciplina.id, nome: disciplina.nome, codigo: disciplina.codigo},
  },
  aluno: {ra, nome},
});

let matriculas = [
  createMatricula({
    id: IDS.matricula,
    ra: "2026000001",
    nome: alunoUser.nome,
    email: alunoUser.email,
    cpf: alunoUser.cpf,
  }),
  createMatricula({
    id: IDS_EXTRA.matricula2,
    ra: "2026000002",
    nome: "Aluno Novo E2E",
    email: "aluno2@opensga.dev",
    cpf: "333.333.333-33",
  }),
  createMatricula({
    id: IDS_EXTRA.matriculaFora,
    ra: "2026000099",
    nome: "Aluno Fora Matriz",
    email: "fora@opensga.dev",
    cpf: "444.444.444-44",
  }),
];

let diarios = [
  createDiario({
    id: IDS.diario,
    matriculaId: IDS.matricula,
    ra: "2026000001",
    nome: alunoUser.nome,
  }),
];

const resetState = () => {
  diarios = [
    createDiario({
      id: IDS.diario,
      matriculaId: IDS.matricula,
      ra: "2026000001",
      nome: alunoUser.nome,
    }),
  ];
};

const diarioPrincipal = () => diarios.find((d) => d.id === IDS.diario) ?? diarios[0];

const meForRole = (role) => {
  if (role === "PROFESSOR") {
    return {
      ...professorUser,
      ativo: true,
      aluno: null,
      professor: {
        id: IDS.professor,
        matricula: "PROF-001",
        titulacao: "Mestre",
      },
      dependentes: [],
    };
  }

  if (role === "ALUNO") {
    return {
      ...alunoUser,
      ativo: true,
      aluno: {id: "00000000-0000-4000-8000-0000000000al", ra: "2026000001"},
      professor: null,
      dependentes: [],
    };
  }

  return {
    ...adminUser,
    ativo: true,
    aluno: null,
    professor: null,
    dependentes: [],
  };
};

const calcNs = (av, avs) => {
  const valores = [av, avs].filter((v) => typeof v === "number");
  if (valores.length === 0) {
    return null;
  }
  return Math.max(...valores);
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);
  const path = url.pathname;
  const method = req.method ?? "GET";
  const role = roleFromAuth(req);

  if (method === "GET" && path === "/health") {
    return json(res, 200, {status: "ok"});
  }

  if (method === "POST" && path === "/api/v1/auth/login") {
    const body = await readBody(req);
    const {identificador, senha} = body;

    if (identificador === "testeadmin@opensga.dev" && senha === "Admin@123456") {
      return json(res, 200, {
        token: encodeJwt({
          sub: adminUser.id,
          role: "ADMIN",
          email: adminUser.email,
          exp: Math.floor(Date.now() / 1000) + 20 * 60,
        }),
        user: adminUser,
      });
    }

    if (
      (identificador === "PROF-001" || identificador === "professor@opensga.dev") &&
      senha === "Professor@123456"
    ) {
      return json(res, 200, {
        token: encodeJwt({
          sub: professorUser.id,
          role: "PROFESSOR",
          email: professorUser.email,
          exp: Math.floor(Date.now() / 1000) + 20 * 60,
        }),
        user: professorUser,
      });
    }

    if (
      (identificador === "2026000001" || identificador === "aluno@opensga.dev") &&
      senha === "Aluno@123456"
    ) {
      return json(res, 200, {
        token: encodeJwt({
          sub: alunoUser.id,
          role: "ALUNO",
          email: alunoUser.email,
          exp: Math.floor(Date.now() / 1000) + 30 * 60,
        }),
        user: alunoUser,
      });
    }

    return json(res, 401, {error: "Credenciais inválidas"});
  }

  if (method === "GET" && path === "/api/v1/auth/me") {
    return json(res, 200, meForRole(role));
  }

  if (method === "GET" && path === "/api/v1/parametrizacoes") {
    return json(res, 200, parametrizacoes);
  }

  if (method === "GET" && path === "/api/v1/dashboard/admin") {
    if (role === "PROFESSOR") {
      return json(res, 403, {error: "Forbidden"});
    }
    return json(res, 200, {
      anoLetivo: 2026,
      semestreLetivo: 2,
      matriculasPorStatus: [
        {status: "ATIVO", quantidade: 10},
        {status: "PRE_MATRICULADO", quantidade: 2},
        {status: "TRANCADO", quantidade: 1},
        {status: "CANCELADO", quantidade: 0},
        {status: "FORMADO", quantidade: 0},
        {status: "EVADIDO", quantidade: 0},
        {status: "TRANSFERIDO", quantidade: 0},
      ],
      turmasNoPeriodo: 1,
      ocupacaoMedia: 50,
      faturasPendentes: 2,
      reclamacoesAbertas: 1,
    });
  }

  if (method === "GET" && path === "/api/v1/dashboard/professor") {
    if (role === "ADMIN") {
      return json(res, 403, {error: "Forbidden"});
    }
    return json(res, 200, {
      anoLetivo: 2026,
      semestreLetivo: 2,
      turmas: [
        {
          id: turmaProfessor.id,
          codigo: turmaProfessor.codigo,
          capacidade: 60,
          quantidadeDiarios: 1,
        },
      ],
      lancamentosPendentes: diarios.filter((d) => d.notaSemestral === null && !d.semestreFechado)
        .length,
    });
  }

  if (method === "GET" && path === "/api/v1/academic/campi") {
    return json(res, 200, [campus]);
  }

  if (method === "GET" && path === `/api/v1/academic/campi/${IDS.campus}`) {
    return json(res, 200, campus);
  }

  if (method === "GET" && path === "/api/v1/academic/cursos") {
    return json(res, 200, [curso]);
  }

  if (method === "GET" && path === "/api/v1/academic/disciplinas") {
    return json(res, 200, [disciplina, disciplinaExt]);
  }

  if (method === "GET" && path === "/api/v1/academic/matrizes") {
    return json(res, 200, matrizes);
  }

  if (method === "GET" && path === `/api/v1/academic/matrizes/${IDS.matrizOk}`) {
    return json(res, 200, {
      ...matrizes[0],
      curso: {id: curso.id, nome: curso.nome, modalidade: curso.modalidade},
      componentes: componentesOk,
    });
  }

  if (method === "GET" && path === `/api/v1/academic/matrizes/${IDS.matrizBaixa}`) {
    return json(res, 200, {
      ...matrizes[1],
      curso: {id: curso.id, nome: curso.nome, modalidade: curso.modalidade},
      componentes: [componentesOk[0]],
    });
  }

  if (method === "GET" && path === `/api/v1/academic/matrizes/${IDS.matrizOk}/componentes`) {
    return json(res, 200, componentesOk);
  }

  if (method === "GET" && path === `/api/v1/academic/matrizes/${IDS.matrizBaixa}/componentes`) {
    return json(res, 200, [componentesOk[0]]);
  }

  if (method === "GET" && path === `/api/v1/academic/matrizes/${IDS.matrizOk}/auditoria-mec`) {
    return json(res, 200, auditoria(IDS.matrizOk, true));
  }

  if (method === "GET" && path === `/api/v1/academic/matrizes/${IDS.matrizBaixa}/auditoria-mec`) {
    return json(res, 200, auditoria(IDS.matrizBaixa, false));
  }

  if (method === "GET" && path === `/api/v1/academic/matrizes/${IDS.matrizOk}/auditoria`) {
    return json(res, 200, auditoria(IDS.matrizOk, true));
  }

  if (method === "GET" && path === `/api/v1/academic/matrizes/${IDS.matrizBaixa}/auditoria`) {
    return json(res, 409, {
      error: "Violação regulatória",
      message: "Extensão abaixo do mínimo",
      violacoes: auditoria(IDS.matrizBaixa, false).violacoes,
    });
  }

  if (method === "GET" && path === "/api/v1/users/professores") {
    return json(res, 200, [
      {
        id: IDS.professor,
        matricula: "PROF-001",
        titulacao: "Mestre",
        departamento: "Computação",
        user: {
          id: IDS.professorUser,
          nome: professorUser.nome,
          email: professorUser.email,
          cpf: professorUser.cpf,
          telefone: null,
          avatarUrl: null,
          role: "PROFESSOR",
          ativo: true,
        },
      },
    ]);
  }

  if (method === "GET" && path === "/api/v1/academic/turmas") {
    if (role === "PROFESSOR") {
      return json(res, 200, [turmaProfessor]);
    }
    return json(res, 200, [turmaProfessor, turmaOutra]);
  }

  if (method === "GET" && path === `/api/v1/academic/turmas/${IDS.turma}`) {
    return json(res, 200, turmaProfessor);
  }

  if (method === "GET" && path === `/api/v1/academic/turmas/${IDS.turmaOutra}`) {
    if (role === "PROFESSOR") {
      return json(res, 403, {error: "Forbidden"});
    }
    return json(res, 200, turmaOutra);
  }

  if (method === "POST" && path === "/__e2e/reset") {
    resetState();
    return json(res, 200, {ok: true});
  }

  if (method === "GET" && path === "/api/v1/matriculas") {
    return json(res, 200, matriculas);
  }

  if (method === "GET" && path === "/api/v1/diario") {
    const turmaId = url.searchParams.get("turmaId");
    if (turmaId && turmaId !== IDS.turma) {
      return json(res, 200, []);
    }
    return json(res, 200, diarios);
  }

  if (method === "GET" && path.startsWith("/api/v1/diario/")) {
    const id = path.split("/").pop();
    const found = diarios.find((d) => d.id === id);
    if (!found) {
      return json(res, 404, {error: "Diário não encontrado"});
    }
    return json(res, 200, found);
  }

  if (method === "POST" && path === "/api/v1/diario/enturmar") {
    if (role === "PROFESSOR") {
      return json(res, 403, {error: "Forbidden"});
    }
    const body = await readBody(req);
    if (body.matriculaId === IDS_EXTRA.matriculaFora) {
      return json(res, 400, {error: "Disciplina fora da matriz"});
    }
    const mat = matriculas.find((m) => m.id === body.matriculaId);
    if (!mat) {
      return json(res, 404, {error: "Matrícula não encontrada"});
    }
    if (diarios.some((d) => d.matriculaId === body.matriculaId && d.turmaId === body.turmaId)) {
      return json(res, 409, {error: "Aluno já enturmado"});
    }
    const novo = createDiario({
      id: IDS_EXTRA.diario2,
      matriculaId: mat.id,
      ra: mat.aluno.ra,
      nome: mat.aluno.user.nome,
    });
    diarios = [...diarios, novo];
    return json(res, 201, {
      id: novo.id,
      matriculaId: novo.matriculaId,
      turmaId: novo.turmaId,
      disciplina: {id: disciplina.id, nome: disciplina.nome, codigo: disciplina.codigo},
      aluno: {ra: novo.aluno.ra, nome: novo.aluno.nome},
    });
  }

  if (method === "PATCH" && path === "/api/v1/diario/avaliar") {
    const body = await readBody(req);
    if (role === "PROFESSOR" && body.diarioClasseId === "00000000-0000-4000-8000-0000000000xx") {
      return json(res, 403, {error: "Forbidden"});
    }
    const diario = diarios.find((d) => d.id === body.diarioClasseId);
    if (!diario) {
      return json(res, 404, {error: "Diário não encontrado"});
    }
    if (role === "PROFESSOR" && diario.turmaId !== IDS.turma) {
      return json(res, 403, {error: "Forbidden"});
    }
    if (diario.semestreFechado) {
      return json(res, 409, {error: "Semestre já fechado"});
    }

    if (body.notaAv !== undefined) {
      diario.notaAv = body.notaAv;
    }
    if (body.notaAvs !== undefined) {
      diario.notaAvs = body.notaAvs;
    }
    if (body.notaAv3 !== undefined) {
      if (!diario.habilitaAv3 && body.notaAv3 !== null && body.notaAv3 !== undefined) {
        return json(res, 400, {error: "AV3 não habilitada"});
      }
      diario.notaAv3 = body.notaAv3;
    }
    if (body.totalFaltas !== undefined) {
      diario.totalFaltas = body.totalFaltas;
    }

    diario.notaSemestral = calcNs(diario.notaAv, diario.notaAvs);
    const limite = Math.floor(diario.chTotal * 0.25);
    diario.habilitaAv3 =
      diario.notaSemestral !== null &&
      diario.notaSemestral < 6 &&
      diario.totalFaltas <= limite;

    return json(res, 200, {
      id: diario.id,
      notaAv: diario.notaAv,
      notaAvs: diario.notaAvs,
      notaAv3: diario.notaAv3,
      notaSemestral: diario.notaSemestral,
      mediaFinal: diario.mediaFinal,
      habilitaAv3: diario.habilitaAv3,
      totalFaltas: diario.totalFaltas,
      chTotal: diario.chTotal,
      chCumprida: diario.chCumprida,
      statusDisciplina: diario.statusDisciplina,
      semestreFechado: diario.semestreFechado,
    });
  }

  if (method === "POST" && path === "/api/v1/diario/fechar-semestre") {
    const body = await readBody(req);
    if (body.turmaId !== IDS.turma) {
      return json(res, 404, {error: "Turma não encontrada"});
    }

    for (const diario of diarios) {
      const limite = Math.floor(diario.chTotal * 0.25);
      if (diario.totalFaltas > limite) {
        diario.statusDisciplina = "RF";
        diario.mediaFinal = null;
        diario.chCumprida = 0;
      } else if (diario.notaSemestral !== null && diario.notaSemestral >= 6) {
        diario.statusDisciplina = "APROVADO";
        diario.mediaFinal = diario.notaSemestral;
        diario.chCumprida = diario.chTotal;
      } else if (diario.habilitaAv3 && diario.notaAv3 !== null) {
        const mf = (diario.notaSemestral + diario.notaAv3) / 2;
        diario.mediaFinal = mf;
        diario.statusDisciplina = mf >= 5 ? "APROVADO" : "RN";
        diario.chCumprida = mf >= 5 ? diario.chTotal : 0;
      } else if (diario.notaSemestral === null || (diario.habilitaAv3 && diario.notaAv3 === null)) {
        return json(res, 409, {error: "AV3 obrigatória ausente"});
      }
      diario.semestreFechado = true;
    }

    return json(res, 200, {
      turmaId: IDS.turma,
      fechados: diarios.length,
      diarios: diarios.map((diario) => ({
        id: diario.id,
        notaAv: diario.notaAv,
        notaAvs: diario.notaAvs,
        notaAv3: diario.notaAv3,
        notaSemestral: diario.notaSemestral,
        mediaFinal: diario.mediaFinal,
        habilitaAv3: diario.habilitaAv3,
        totalFaltas: diario.totalFaltas,
        chTotal: diario.chTotal,
        chCumprida: diario.chCumprida,
        statusDisciplina: diario.statusDisciplina,
        semestreFechado: diario.semestreFechado,
      })),
    });
  }

  if (method === "GET" && path === "/api/v1/financeiro/faturas") {
    return json(res, 200, []);
  }

  if (method === "GET" && path === "/api/v1/comunicados") {
    return json(res, 200, []);
  }

  if (method === "GET" && path === "/api/v1/portal/contexto") {
    const d = diarioPrincipal();
    return json(res, 200, {
      aluno: {
        id: "00000000-0000-4000-8000-0000000000al",
        ra: "2026000001",
        nome: alunoUser.nome,
        email: alunoUser.email,
        cpf: alunoUser.cpf,
        telefone: null,
        dataNascimento: "2000-01-01",
        avatarUrl: null,
      },
      matricula: {
        id: IDS.matricula,
        ra: "2026000001",
        status: "ATIVO",
        periodoAtual: 1,
        semestreIngresso: "2026.1",
        curso: {
          id: curso.id,
          nome: curso.nome,
          modalidade: "PRESENCIAL",
          campus: {nome: campus.nome, codigoPolo: campus.codigoPolo},
        },
        matrizCurricular: {
          id: IDS.matrizOk,
          nome: "Matriz 2026.1 Conforme",
          anoVigencia: 2026,
          chTotalCurso: 140,
          chIntegralizada: d.chCumprida,
        },
      },
      disciplinas: [
        {
          id: d.id,
          codigoTurma: turmaProfessor.codigo,
          codigoDisciplina: disciplina.codigo,
          nomeDisciplina: disciplina.nome,
          professorNome: professorUser.nome,
          horario: turmaProfessor.horario,
          salaOuLink: turmaProfessor.salaOuLink,
          tipoEntrega: "PRESENCIAL_FISICO",
          anoLetivo: 2026,
          semestreLetivo: 2,
          chTotal: 60,
          chCumprida: d.chCumprida,
          totalFaltas: d.totalFaltas,
          notaAv: d.notaAv,
          notaAvs: d.notaAvs,
          notaAv3: d.notaAv3,
          notaSemestral: d.notaSemestral,
          mediaFinal: d.mediaFinal,
          habilitaAv3: d.habilitaAv3,
          statusDisciplina: d.statusDisciplina,
          semestreFechado: d.semestreFechado,
        },
      ],
      matriz: [],
      faturas: [],
      comunicados: [],
      ouvidoria: [],
    });
  }

  if (method === "GET" && path.startsWith("/api/v1/")) {
    return json(res, 200, []);
  }

  return json(res, 404, {error: "Not found", message: path});
});

server.listen(PORT, "127.0.0.1", () => {
  process.stdout.write(`OpenSGA E2E mock API on ${PORT}\n`);
});
