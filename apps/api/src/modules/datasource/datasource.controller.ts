import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DataSourceService } from './datasource.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  UserRole,
  DataSourceResponseDto,
  TestConnectionResultDto,
  DataSourceSchemaResponseDto,
  SyncSchemaResultDto,
} from '@lupbi/shared-types';
import { CreateDataSourceInputDto, TestConnectionInputDto } from './dto/create-datasource.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/datasources')
export class DataSourceController {
  constructor(private readonly dataSourceService: DataSourceService) {}

  // ─── TEST CONNECTION (Admin Only) ─────────────────────────────────────────
  @Roles(UserRole.ADMIN)
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async testConnection(
    @Body() dto: TestConnectionInputDto,
  ): Promise<TestConnectionResultDto> {
    return this.dataSourceService.testConnection(dto);
  }

  // ─── CREATE DATA SOURCE (Admin Only) ──────────────────────────────────────
  @Roles(UserRole.ADMIN)
  @Post()
  async createDataSource(
    @Body() dto: CreateDataSourceInputDto,
  ): Promise<DataSourceResponseDto> {
    return this.dataSourceService.createDataSource(dto);
  }

  // ─── GET ALL DATA SOURCES (Admin & Creator) ───────────────────────────────
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @Get()
  async getDataSources(): Promise<DataSourceResponseDto[]> {
    return this.dataSourceService.getDataSources();
  }

  // ─── GET DATA SOURCE BY ID ────────────────────────────────────────────────
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @Get(':id')
  async getDataSourceById(@Param('id') id: string): Promise<DataSourceResponseDto> {
    return this.dataSourceService.getDataSourceById(id);
  }

  // ─── UPDATE DATA SOURCE (Admin Only) ──────────────────────────────────────
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async updateDataSource(
    @Param('id') id: string,
    @Body() dto: CreateDataSourceInputDto,
  ): Promise<DataSourceResponseDto> {
    return this.dataSourceService.updateDataSource(id, dto);
  }

  // ─── DELETE DATA SOURCE (Admin Only) ──────────────────────────────────────
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteDataSource(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.dataSourceService.deleteDataSource(id);
  }

  // ─── GET CACHED SCHEMA TREE (CONN-02) ─────────────────────────────────────
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @Get(':id/schema')
  async getSchema(@Param('id') id: string): Promise<DataSourceSchemaResponseDto> {
    return this.dataSourceService.getSchema(id);
  }

  // ─── SYNC SCHEMA METADATA (CONN-02) ───────────────────────────────────────
  @Roles(UserRole.ADMIN, UserRole.CREATOR)
  @Post(':id/sync-schema')
  @HttpCode(HttpStatus.OK)
  async syncSchema(@Param('id') id: string): Promise<SyncSchemaResultDto> {
    return this.dataSourceService.syncSchema(id);
  }
}
