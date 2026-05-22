import { PaginationDto } from '@/common/dtos/paginationDto.dto';
import { InfiniteDataResponseType } from '@/common/types/infiniteDataResponse.type';
import { Metric } from '@/generated/prisma/client';
import { UpdateMetricDto } from '../dto/update-metric.dto';

export abstract class IMetricsRepository {
  abstract findAllMetrics(
    query: PaginationDto,
  ): Promise<InfiniteDataResponseType<Metric>>;

  abstract findMetricById(id: string): Promise<Nullable<Metric>>;

  abstract findMetricByName(name: string): Promise<Nullable<Metric>>;

  abstract upsertByName(name: string): Promise<Metric>;

  abstract updateMetricById(
    id: string,
    updateData: UpdateMetricDto,
  ): Promise<Metric>;

  abstract deleteMetricById(id: string): Promise<void>;
}
