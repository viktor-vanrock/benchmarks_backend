import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '@/common/dtos/paginationDto.dto';
import { InfiniteDataResponseType } from '@/common/types/infiniteDataResponse.type';
import { MetricDefinition } from '@/generated/prisma/client';
import { CreateMetricDefinitionDto } from './dto/create-metric-definition.dto';
import { UpdateMetricDefinitionDto } from './dto/update-metric-definition.dto';
import { IMetricsRepository } from './repositories/metrics.repository.interface';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    @Inject(IMetricsRepository)
    private readonly metricsRepository: IMetricsRepository,
  ) {}

  async createMetric(
    metricData: CreateMetricDefinitionDto,
  ): Promise<MetricDefinition> {
    this.logger.debug(
      `Trying to create/upsert metric definition with name="${metricData.name}"`,
    );

    await this.assertLookupsExist(
      metricData.priorityId,
      metricData.directionId,
    );

    this.assertValueRange(metricData.minValue, metricData.maxValue);

    const metric = await this.metricsRepository.upsertByName(metricData);

    this.logger.log(
      `Metric definition ready: id="${metric.id}", name="${metric.name}"`,
    );

    return metric;
  }

  async findAllMetrics(
    queryParams: PaginationDto,
  ): Promise<InfiniteDataResponseType<MetricDefinition>> {
    this.logger.debug('Fetching all metric definitions');

    return this.metricsRepository.findAllMetrics(queryParams);
  }

  async findMetricById(id: string): Promise<MetricDefinition> {
    this.logger.debug(`Finding metric definition by id="${id}"`);

    const metric = await this.metricsRepository.findMetricById(id);

    if (!metric) {
      this.logger.warn(`Metric definition with id="${id}" was not found`);

      throw new NotFoundException(
        `Metric definition with id "${id}" was not found`,
      );
    }

    return metric;
  }

  async updateMetricById(
    id: string,
    updateData: UpdateMetricDefinitionDto,
  ): Promise<MetricDefinition> {
    this.logger.debug(`Trying to update metric definition id="${id}"`);

    const currentMetric = await this.metricsRepository.findMetricById(id);

    if (!currentMetric) {
      this.logger.warn(`Metric definition with id="${id}" was not found`);

      throw new NotFoundException(
        `Metric definition with id "${id}" was not found`,
      );
    }

    if (updateData.name && updateData.name !== currentMetric.name) {
      const existingMetric = await this.metricsRepository.findMetricByName(
        updateData.name,
      );

      if (existingMetric && existingMetric.id !== id) {
        this.logger.warn(
          `Cannot update metric definition id="${id}": name="${updateData.name}" is already taken`,
        );

        throw new ConflictException(
          `Metric definition with name "${updateData.name}" already exists`,
        );
      }
    }

    if (updateData.priorityId || updateData.directionId) {
      await this.assertLookupsExist(
        updateData.priorityId,
        updateData.directionId,
      );
    }

    const nextMin =
      updateData.minValue !== undefined
        ? updateData.minValue
        : (currentMetric.minValue as unknown as number | null);

    const nextMax =
      updateData.maxValue !== undefined
        ? updateData.maxValue
        : (currentMetric.maxValue as unknown as number | null);

    this.assertValueRange(nextMin, nextMax);

    const updatedMetric = await this.metricsRepository.updateMetricById(
      id,
      updateData,
    );

    this.logger.log(`Metric definition updated successfully: id="${id}"`);

    return updatedMetric;
  }

  async deleteMetricById(id: string): Promise<void> {
    this.logger.debug(`Trying to delete metric definition id="${id}"`);

    const metric = await this.metricsRepository.findMetricById(id);

    if (!metric) {
      this.logger.warn(`Metric definition with id="${id}" was not found`);

      throw new NotFoundException(
        `Metric definition with id "${id}" was not found`,
      );
    }

    await this.metricsRepository.deleteMetricById(id);

    this.logger.log(`Metric definition deleted successfully: id="${id}"`);
  }

  // ------------------------------------------------------------------
  // private helpers
  // ------------------------------------------------------------------

  private async assertLookupsExist(
    priorityId?: string,
    directionId?: string,
  ): Promise<void> {
    if (priorityId) {
      const ok = await this.metricsRepository.existsPriority(priorityId);

      if (!ok) {
        throw new BadRequestException(
          `Metric priority with id "${priorityId}" was not found`,
        );
      }
    }

    if (directionId) {
      const ok = await this.metricsRepository.existsDirection(directionId);

      if (!ok) {
        throw new BadRequestException(
          `Metric direction with id "${directionId}" was not found`,
        );
      }
    }
  }

  private assertValueRange(
    minValue: number | null | undefined,
    maxValue: number | null | undefined,
  ): void {
    if (
      minValue !== null &&
      minValue !== undefined &&
      maxValue !== null &&
      maxValue !== undefined &&
      Number(minValue) > Number(maxValue)
    ) {
      throw new BadRequestException(
        `Invalid value range: minValue (${minValue}) must be <= maxValue (${maxValue})`,
      );
    }
  }
}
