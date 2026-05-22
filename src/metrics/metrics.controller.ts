import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/decorators/role.decorator';
import { PaginationDto } from '@/common/dtos/paginationDto.dto';
import { Role } from '@/common/enums/role.enum';
import { CreateMetricDto } from './dto/create-metric.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@ApiBearerAuth()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Roles(Role.User, Role.Admin, Role.SuperUser)
  @Post()
  async createMetric(@Body() body: CreateMetricDto) {
    return await this.metricsService.createMetric(body);
  }

  @Roles(Role.User, Role.Admin, Role.SuperUser)
  @Get()
  async findAllMetrics(@Query() queryParams: PaginationDto) {
    return await this.metricsService.findAllMetrics(queryParams);
  }

  @Roles(Role.Admin, Role.SuperUser)
  @Patch(':id')
  async updateMetricById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateMetricDto
  ) {
    return await this.metricsService.updateMetricById(id, body);
  }

  @Roles(Role.Admin, Role.SuperUser)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMetricById(
    @Param('id', new ParseUUIDPipe()) id: string
  ) {
    return await this.metricsService.deleteMetricById(id);
  }
}
