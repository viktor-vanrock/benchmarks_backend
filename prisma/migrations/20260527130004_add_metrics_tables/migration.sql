-- DropForeignKey
ALTER TABLE "benchmark_metrics" DROP CONSTRAINT IF EXISTS "benchmark_metrics_benchmarkId_fkey";
ALTER TABLE "benchmark_metrics" DROP CONSTRAINT IF EXISTS "benchmark_metrics_metricId_fkey";

-- DropTable
DROP TABLE IF EXISTS "benchmark_metrics";
DROP TABLE IF EXISTS "metrics";

-- =====================================================================
-- Lookups
-- =====================================================================

CREATE TABLE "metric_priority_lookups" (
    "id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "metric_priority_lookups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "metric_priority_lookups_code_key" ON "metric_priority_lookups"("code");

CREATE TABLE "metric_direction_lookups" (
    "id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "metric_direction_lookups_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "metric_direction_lookups_code_key" ON "metric_direction_lookups"("code");

-- =====================================================================
-- Metric definitions
-- =====================================================================

CREATE TABLE "metric_definitions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "displayName" VARCHAR(255),
    "priorityId" UUID NOT NULL,
    "directionId" UUID NOT NULL,
    "minValue" DECIMAL(12,6),
    "maxValue" DECIMAL(12,6),
    "targetValue" DECIMAL(12,6),
    "evaluationLogic" TEXT,
    "requiredGigaChatQualityLevel" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "metric_definitions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "metric_definitions_name_key" ON "metric_definitions"("name");
CREATE INDEX "metric_definitions_priorityId_idx" ON "metric_definitions"("priorityId");

ALTER TABLE "metric_definitions"
    ADD CONSTRAINT "metric_definitions_priorityId_fkey"
    FOREIGN KEY ("priorityId") REFERENCES "metric_priority_lookups"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "metric_definitions"
    ADD CONSTRAINT "metric_definitions_directionId_fkey"
    FOREIGN KEY ("directionId") REFERENCES "metric_direction_lookups"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- =====================================================================
-- Metric results
-- =====================================================================

CREATE TABLE "metric_results" (
    "id" UUID NOT NULL,
    "runId" UUID,
    "benchmarkId" UUID NOT NULL,
    "testId" UUID NOT NULL,
    "subsetId" UUID,
    "metricId" UUID NOT NULL,
    "modelId" UUID NOT NULL,
    "value" DECIMAL(14,6) NOT NULL,
    "rawValue" VARCHAR(255),
    "obtainedAt" TIMESTAMPTZ(6) NOT NULL,
    "importSource" VARCHAR(500),
    "rawModelName" VARCHAR(500),
    "rawBenchmarkName" VARCHAR(500),
    "rawTestName" VARCHAR(500),
    "rawSubsetName" VARCHAR(500),
    "rawMetricName" VARCHAR(255),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "metric_results_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "metric_results_benchmarkId_testId_metricId_modelId_obtained_idx"
    ON "metric_results"("benchmarkId", "testId", "metricId", "modelId", "obtainedAt");
CREATE INDEX "metric_results_subsetId_idx" ON "metric_results"("subsetId");
CREATE INDEX "metric_results_runId_idx" ON "metric_results"("runId");

ALTER TABLE "metric_results"
    ADD CONSTRAINT "metric_results_benchmarkId_fkey"
    FOREIGN KEY ("benchmarkId") REFERENCES "benchmarks"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "metric_results"
    ADD CONSTRAINT "metric_results_metricId_fkey"
    FOREIGN KEY ("metricId") REFERENCES "metric_definitions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================================
-- Metric upload rows (raw import staging)
-- =====================================================================

CREATE TABLE "metric_upload_rows" (
    "id" UUID NOT NULL,
    "runId" UUID,
    "modelId" UUID,
    "rawModelName" VARCHAR(500) NOT NULL,
    "benchmarkId" UUID,
    "rawBenchmarkName" VARCHAR(500) NOT NULL,
    "testId" UUID,
    "rawTestName" VARCHAR(500) NOT NULL,
    "subsetId" UUID,
    "rawSubsetName" VARCHAR(500),
    "metricId" UUID,
    "rawMetricName" VARCHAR(255) NOT NULL,
    "metricValue" DECIMAL(14,6) NOT NULL,
    "rawMetricValue" VARCHAR(255),
    "obtainedAt" TIMESTAMPTZ(6) NOT NULL,
    "metricResultId" UUID,
    "importBatchId" VARCHAR(255),
    "sourceRowNumber" INTEGER,
    "importSource" VARCHAR(500),
    "rawPayload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "metric_upload_rows_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "metric_upload_rows_modelId_benchmarkId_testId_subsetId_metr_idx"
    ON "metric_upload_rows"("modelId", "benchmarkId", "testId", "subsetId", "metricId", "obtainedAt");
CREATE INDEX "metric_upload_rows_rawModelName_rawBenchmarkName_rawTestNam_idx"
    ON "metric_upload_rows"("rawModelName", "rawBenchmarkName", "rawTestName", "rawMetricName");
CREATE INDEX "metric_upload_rows_importBatchId_sourceRowNumber_idx"
    ON "metric_upload_rows"("importBatchId", "sourceRowNumber");

ALTER TABLE "metric_upload_rows"
    ADD CONSTRAINT "metric_upload_rows_benchmarkId_fkey"
    FOREIGN KEY ("benchmarkId") REFERENCES "benchmarks"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "metric_upload_rows"
    ADD CONSTRAINT "metric_upload_rows_metricId_fkey"
    FOREIGN KEY ("metricId") REFERENCES "metric_definitions"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "metric_upload_rows"
    ADD CONSTRAINT "metric_upload_rows_metricResultId_fkey"
    FOREIGN KEY ("metricResultId") REFERENCES "metric_results"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================================
-- Seed: справочники метрик (идемпотентно)
-- =====================================================================

INSERT INTO "metric_priority_lookups" ("id", "code", "name", "description", "createdAt", "updatedAt")
VALUES
    (gen_random_uuid(), 'CRITICAL', 'Критическая',  'Метрика блокирует релиз модели при провале порогового значения',         NOW(), NOW()),
    (gen_random_uuid(), 'HIGH',     'Высокая',      'Ключевая метрика качества, существенно влияет на итоговую оценку модели', NOW(), NOW()),
    (gen_random_uuid(), 'MEDIUM',   'Средняя',      'Важная, но не блокирующая метрика; учитывается со средним весом',         NOW(), NOW()),
    (gen_random_uuid(), 'LOW',      'Низкая',       'Информационная метрика с минимальным весом в общей оценке модели',        NOW(), NOW()),
    (gen_random_uuid(), 'OPTIONAL', 'Опциональная', 'Справочная метрика, не участвует в сравнении и ранжировании моделей',     NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "metric_direction_lookups" ("id", "code", "name", "description", "createdAt", "updatedAt")
VALUES
    (gen_random_uuid(), 'HIGHER_IS_BETTER', 'Чем больше — тем лучше',        'Лучшие модели максимизируют значение метрики (accuracy, F1, BLEU)',          NOW(), NOW()),
    (gen_random_uuid(), 'LOWER_IS_BETTER',  'Чем меньше — тем лучше',        'Лучшие модели минимизируют значение метрики (latency, perplexity, loss)',     NOW(), NOW()),
    (gen_random_uuid(), 'TARGET_VALUE',     'Стремление к целевому значению', 'Оптимум достигается при значении близком к targetValue (калибровка, bias)',   NOW(), NOW()),
    (gen_random_uuid(), 'NEUTRAL',          'Нейтральное',                   'Направление не определено; метрика носит описательный/диагностический характер', NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;