import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '@/common/dtos/paginationDto.dto';
import { InfiniteDataResponseType } from '@/common/types/infiniteDataResponse.type';
import { Metric } from '@/generated/prisma/client';
import { CreateMetricDto } from './dto/create-metric.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';
import { IMetricsRepository } from './repositories/metrics.repository.interface';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    @Inject(IMetricsRepository)
    private readonly metricsRepository: IMetricsRepository
  ) {}

  async createMetric(metricData: CreateMetricDto): Promise<Metric> {
    this.logger.debug(
      `Trying to create/upsert metric with name="${metricData.name}"`
    );

    const metric = await this.metricsRepository.upsertByName(
      metricData.name
    );

    this.logger.log(
      `Metric ready: id="${metric.id}", name="${metric.name}"`
    );

    return metric;
  }

  async findAllMetrics(
    queryParams: PaginationDto
  ): Promise<InfiniteDataResponseType<Metric>> {
    this.logger.debug('Fetching all metrics');

    return this.metricsRepository.findAllMetrics(queryParams);
  }

  async findMetricById(id: string): Promise<Metric> {
    this.logger.debug(`Finding metric by id="${id}"`);

    const metric = await this.metricsRepository.findMetricById(id);

    if (!metric) {
      this.logger.warn(`Metric with id="${id}" was not found`);

      throw new NotFoundException(`Metric with id "${id}" was not found`);
    }

    return metric;
  }

  async updateMetricById(
    id: string,
    updateData: UpdateMetricDto
  ): Promise<Metric> {
    this.logger.debug(`Trying to update metric id="${id}"`);

    const currentMetric = await this.metricsRepository.findMetricById(id);

    if (!currentMetric) {
      this.logger.warn(`Metric with id="${id}" was not found`);

      throw new NotFoundException(`Metric with id "${id}" was not found`);
    }

    if (
      updateData.name &&
      updateData.name !== currentMetric.name
    ) {
      const existingMetric =
        await this.metricsRepository.findMetricByName(updateData.name);

      if (existingMetric && existingMetric.id !== id) {
        this.logger.warn(
          `Cannot update metric id="${id}": name="${updateData.name}" is already taken`
        );

        throw new ConflictException(
          `Metric with name "${updateData.name}" already exists`
        );
      }
    }

    const updatedMetric = await this.metricsRepository.updateMetricById(
      id,
      updateData
    );

    this.logger.log(`Metric updated successfully: id="${id}"`);

    return updatedMetric;
  }

  async deleteMetricById(id: string): Promise<void> {
    this.logger.debug(`Trying to delete metric id="${id}"`);

    const metric = await this.metricsRepository.findMetricById(id);

    if (!metric) {
      this.logger.warn(`Metric with id="${id}" was not found`);

      throw new NotFoundException(`Metric with id "${id}" was not found`);
    }

    await this.metricsRepository.deleteMetricById(id);

    this.logger.log(`Metric deleted successfully: id="${id}"`);
  }
}
