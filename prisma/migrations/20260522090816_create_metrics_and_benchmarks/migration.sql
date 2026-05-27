-- CreateTable
CREATE TABLE "benchmarks" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "benchmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" UUID NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benchmark_metrics" (
    "benchmarkId" UUID NOT NULL,
    "metricId" UUID NOT NULL,

    CONSTRAINT "benchmark_metrics_pkey" PRIMARY KEY ("benchmarkId","metricId")
);

-- CreateIndex
CREATE UNIQUE INDEX "metrics_name_key" ON "metrics"("name");

-- AddForeignKey
ALTER TABLE "benchmark_metrics" ADD CONSTRAINT "benchmark_metrics_benchmarkId_fkey" FOREIGN KEY ("benchmarkId") REFERENCES "benchmarks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benchmark_metrics" ADD CONSTRAINT "benchmark_metrics_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "metrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
