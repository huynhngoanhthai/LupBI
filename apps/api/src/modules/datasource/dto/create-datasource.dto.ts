import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { DataSourceType, CreateDataSourceDto } from '@lupbi/shared-types';

export class CreateDataSourceInputDto implements CreateDataSourceDto {
  @IsString()
  @MinLength(2, { message: 'Tên kết nối phải có ít nhất 2 ký tự' })
  name!: string;

  @IsEnum(DataSourceType, { message: 'Loại Database không hợp lệ' })
  type!: DataSourceType;

  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @IsInt()
  port?: number;

  @IsString()
  database!: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  ssl?: boolean;
}

export class TestConnectionInputDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsEnum(DataSourceType, { message: 'Loại Database không hợp lệ' })
  type!: DataSourceType;

  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @IsInt()
  port?: number;

  @IsString()
  database!: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  ssl?: boolean;
}
