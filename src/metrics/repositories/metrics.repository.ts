import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PaginationDto } from '@/common/dtos/paginationDto.dto';
import { SortDirection } from '@/common/enums/sortDirection.enum';
import { InfiniteDataResponseType } from '@/common/types/infiniteDataResponse.type';
import { Metric, Prisma } from '@/generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateMetricDto } from '../dto/update-metric.dto';
import { IMetricsRepository } from './metrics.repository.interface';

@Injectable()
export class MetricsRepository implements IMetricsRepository {
  private readonly logger = new Logger(MetricsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAllMetrics(
    queryParams: PaginationDto
  ): Promise<InfiniteDataResponseType<Metric>> {
    const {
      search,
      page,
      limit,
      sortColumn,
      sortDirection = SortDirection.Asc,
    } = queryParams;

    this.logger.debug(
      `Fetching metrics: page=${page}, limit=${limit}, search="${search ?? ''}", sortColumn="${sortColumn ?? ''}", sortDirection="${sortDirection}"`
    );

    const where: Prisma.MetricWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const allowedSortColumns = new Set([
      'createdAt',
      'name',
    ]);

    const sort =
      sortColumn && allowedSortColumns.has(sortColumn)
        ? sortColumn
        : 'createdAt';

    const prismaSortDirection =
      sortDirection === SortDirection.Asc ? 'asc' : 'desc';

    const orderBy: Prisma.MetricOrderByWithRelationInput = {
      [sort]: prismaSortDirection,
    };

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.metric.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.metric.count({
        where,
      }),
    ]);

    this.logger.debug(
      `Fetched metrics: returned=${data.length}, total=${total}`
    );

    return {
      data,
      total,
    };
  }

  async findMetricById(id: string): Promise<Nullable<Metric>> {
    this.logger.debug(`Finding metric by id="${id}"`);

    return this.prisma.metric.findUnique({
      where: { id },
    });
  }

  async findMetricByName(name: string): Promise<Nullable<Metric>> {
    this.logger.debug(`Finding metric by name="${name}"`);

    return this.prisma.metric.findUnique({
      where: { name },
    });
  }

  async upsertByName(name: string): Promise<Metric> {
    this.logger.debug(`Upserting metric by name="${name}"`);

    const metric = await this.prisma.metric.upsert({
      where: { name },
      create: { name },
      update: {},
    });

    this.logger.log(
      `Metric upserted: id="${metric.id}", name="${metric.name}"`
    );

    return metric;
  }

  async updateMetricById(
    id: string,
    updateData: UpdateMetricDto
  ): Promise<Metric> {
    this.logger.debug(`Updating metric id="${id}"`);

    const metric = await this.prisma.metric.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Metric updated: id="${metric.id}"`);

    return metric;
  }

  async deleteMetricById(id: string): Promise<void> {
    this.logger.debug(`Deleting metric id="${id}"`);

    await this.prisma.metric.delete({
      where: { id },
    });

    this.logger.log(`Metric deleted: id="${id}"`);
  }
}
