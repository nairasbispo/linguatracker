import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Database,
  Cloud,
  Zap,
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { runFirestoreDiagnosticWrite } from '../lib/firebase';

interface DiagnosticResult {
  running: boolean;
  success?: boolean;
  writeMs?: number;
  readMs?: number;
  error?: string;
  testedAt?: Date;
}

export const FirebaseStatusModal: React.FC = () => {
  const {
    modal,
    setModal,
    syncStatus,
    user,
    isAuthLoading,
    loginWithGoogle,
    logout,
    connectionLatency,
    testConnectionNow,
    languages,
    sessions,
    grammar,
    vocabulary,
    goals,
  } = useApp();

  const [diagnostic, setDiagnostic] = useState<DiagnosticResult>({ running: false });
  const [testingConnection, setTestingConnection] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (modal === 'firebase-status') {
      // Auto run a quick latency check when opened
      handleTestConnection();
    }
  }, [modal]);

  if (modal !== 'firebase-status') return null;

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      await testConnectionNow();
    } finally {
      setTestingConnection(false);
    }
  };

  const handleRunDiagnosticTest = async () => {
    setDiagnostic({ running: true });
    try {
      const result = await runFirestoreDiagnosticWrite();
      setDiagnostic({
        running: false,
        success: result.success,
        writeMs: result.writeLatencyMs,
        readMs: result.readLatencyMs,
        error: result.error,
        testedAt: new Date(),
      });
    } catch (err) {
      setDiagnostic({
        running: false,
        success: false,
        error: err instanceof Error ? err.message : String(err),
        testedAt: new Date(),
      });
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err?.message || 'Falha ao autenticar com o Google. Tente novamente.');
    }
  };

  return (
    <div
      id="firebase-status-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setModal(null)}
    >
      <div
        id="firebase-status-modal"
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Painel do Firebase & Firestore
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Ao Vivo
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Status de sincronização em tempo real e verificação de banco de dados
              </p>
            </div>
          </div>
          <button
            id="close-firebase-status-modal"
            onClick={() => setModal(null)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm text-slate-700">
          {/* Status Banner */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-semibold text-emerald-950 text-sm">
                  Firestore Conectado e Operacional
                </span>
                {connectionLatency !== null && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-200/70 text-emerald-900">
                    Latência: {connectionLatency} ms
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed">
                Todas as alterações feitas no vocabulário, sessões de estudo, metas e tópicos gramaticais são sincronizadas instantaneamente com o banco Firestore.
              </p>
            </div>
          </div>

          {/* Database Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-slate-500" />
                Banco de Dados
              </div>
              <div className="font-mono text-xs font-semibold text-slate-800 break-all">
                ai-studio-679e5b77-c30e-454c-a05d-9431e4b181d1
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Instância dedicada para o seu app
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
              <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                Segurança & Regras
              </div>
              <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Regras Ativas e Implantadas
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Leitura e gravação permitidas para coleções
              </div>
            </div>
          </div>

          {/* Real-time Collections Stats */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                Documentos Carregados em Tempo Real
              </span>
              <span className="text-[11px] text-slate-400">
                Total: {languages.length + sessions.length + grammar.length + vocabulary.length + goals.length} docs
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60">
                <div className="text-lg font-bold text-slate-800">{languages.length}</div>
                <div className="text-[11px] text-slate-500 font-medium">Idiomas</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60">
                <div className="text-lg font-bold text-slate-800">{sessions.length}</div>
                <div className="text-[11px] text-slate-500 font-medium">Sessões</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60">
                <div className="text-lg font-bold text-slate-800">{grammar.length}</div>
                <div className="text-[11px] text-slate-500 font-medium">Gramática</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60">
                <div className="text-lg font-bold text-slate-800">{vocabulary.length}</div>
                <div className="text-[11px] text-slate-500 font-medium">Vocábulos</div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60">
                <div className="text-lg font-bold text-slate-800">{goals.length}</div>
                <div className="text-[11px] text-slate-500 font-medium">Metas</div>
              </div>
            </div>
          </div>

          {/* User Authentication Status */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
                  {user ? (
                    user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Avatar'}
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      (user.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()
                    )
                  ) : (
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
                    Firebase Authentication
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {user ? (
                      user.email || user.displayName || 'Usuário Autenticado'
                    ) : (
                      'Modo Conectado / Sessão Ativa'
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {user
                      ? `UID: ${user.uid.slice(0, 16)}...`
                      : 'Você pode entrar com sua conta Google para sincronizar seu perfil'}
                  </div>
                </div>
              </div>

              <div>
                {user ? (
                  <button
                    id="firebase-signout-btn"
                    onClick={logout}
                    disabled={isAuthLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair
                  </button>
                ) : (
                  <button
                    id="firebase-signin-google-btn"
                    onClick={handleGoogleLogin}
                    disabled={isAuthLoading}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    {isAuthLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <LogIn className="w-3.5 h-3.5" />
                    )}
                    Entrar com Google
                  </button>
                )}
              </div>
            </div>

            {authError && (
              <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {authError}
              </div>
            )}
          </div>

          {/* Diagnostic Live Test Section */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Teste de Diagnóstico em Tempo Real
                </span>
                <p className="text-[11px] text-slate-500">
                  Grave e leia um documento de teste diretamente no Firestore para confirmar operação
                </p>
              </div>

              <button
                id="run-firestore-diagnostic-btn"
                onClick={handleRunDiagnosticTest}
                disabled={diagnostic.running}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E5E44] hover:bg-[#164734] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
              >
                {diagnostic.running ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    Executar Teste
                  </>
                )}
              </button>
            </div>

            {diagnostic.testedAt && (
              <div
                className={`p-3 rounded-lg border text-xs ${
                  diagnostic.success
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {diagnostic.success ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold">Sucesso total!</span> Gravação no Firestore concluída em{' '}
                      <strong>{diagnostic.writeMs} ms</strong> e leitura em{' '}
                      <strong>{diagnostic.readMs} ms</strong>.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <div>
                      <span className="font-semibold">Erro no teste:</span> {diagnostic.error}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button
            id="test-connection-refresh-btn"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium py-1 px-2.5 rounded-md hover:bg-slate-200/50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin text-emerald-600' : ''}`} />
            {testingConnection ? 'Medindo latência...' : 'Atualizar Conexão'}
          </button>

          <button
            id="close-status-panel-btn"
            onClick={() => setModal(null)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
