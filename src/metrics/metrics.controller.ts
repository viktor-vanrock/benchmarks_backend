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
import { CreateMetricDefinitionDto } from './dto/create-metric-definition.dto';
import { UpdateMetricDefinitionDto } from './dto/update-metric-definition.dto';
import { MetricsService } from './metrics.service';

@ApiTags('metrics')
@ApiBearerAuth()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post()
  async createMetric(@Body() body: CreateMetricDefinitionDto) {
    return await this.metricsService.createMetric(body);
  }

  @Get()
  async findAllMetrics(@Query() queryParams: PaginationDto) {
    return await this.metricsService.findAllMetrics(queryParams);
  }

  @Get(':id')
  async findMetricById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.metricsService.findMetricById(id);
  }

  @Roles(Role.Admin, Role.SuperUser)
  @Patch(':id')
  async updateMetricById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateMetricDefinitionDto,
  ) {
    return await this.metricsService.updateMetricById(id, body);
  }

  @Roles(Role.Admin, Role.SuperUser)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMetricById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.metricsService.deleteMetricById(id);
  }
}
