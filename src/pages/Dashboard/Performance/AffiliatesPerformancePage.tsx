export default function AffiliatesPerformancePage() {
  return (
    <div className="container p-4 mx-auto space-y-6 md:p-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold md:text-3xl text-foreground">
          Performance de Afiliados
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Análise detalhada da performance dos seus afiliados (em breve)
        </p>
      </div>

      {/* Placeholder Content */}
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 text-6xl">🦈</div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Em Desenvolvimento
          </h2>
          <p className="text-muted-foreground">
            A análise de performance de afiliados estará disponível em breve.
          </p>
        </div>
      </div>
    </div>
  );
}
