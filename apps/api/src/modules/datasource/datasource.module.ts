import { Module } from '@nestjs/common';
import { DataSourceController } from './datasource.controller';
import { DataSourceService } from './datasource.service';
import { EncryptionService } from '../../common/services/encryption.service';

@Module({
  controllers: [DataSourceController],
  providers: [DataSourceService, EncryptionService],
  exports: [DataSourceService, EncryptionService],
})
export class DataSourceModule {}
