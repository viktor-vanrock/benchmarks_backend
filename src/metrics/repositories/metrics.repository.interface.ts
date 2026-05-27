import { PaginationDto } from '@/common/dtos/paginationDto.dto';
import { InfiniteDataResponseType } from '@/common/types/infiniteDataResponse.type';
import { MetricDefinition } from '@/generated/prisma/client';
import { CreateMetricDefinitionDto } from '../dto/create-metric-definition.dto';
import { UpdateMetricDefinitionDto } from '../dto/update-metric-definition.dto';

export abstract class IMetricsRepository {
  abstract findAllMetrics(
    query: PaginationDto,
  ): Promise<InfiniteDataResponseType<MetricDefinition>>;

  abstract findMetricById(id: string): Promise<Nullable<MetricDefinition>>;

  abstract findMetricByName(name: string): Promise<Nullable<MetricDefinition>>;

  abstract createMetric(
    data: CreateMetricDefinitionDto,
  ): Promise<MetricDefinition>;

  abstract upsertByName(
    data: CreateMetricDefinitionDto,
  ): Promise<MetricDefinition>;

  abstract updateMetricById(
    id: string,
    updateData: UpdateMetricDefinitionDto,
  ): Promise<MetricDefinition>;

  abstract deleteMetricById(id: string): Promise<void>;

  abstract existsPriority(priorityId: string): Promise<boolean>;

  abstract existsDirection(directionId: string): Promise<boolean>;
}
