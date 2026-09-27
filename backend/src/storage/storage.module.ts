import { Module } from '@nestjs/common';
import { LocalStorageProvider } from './local-storage.provider';
import { StorageProvider } from './storage.provider.interface';

@Module({
  providers: [
    {
      provide: StorageProvider,
      useClass: LocalStorageProvider,
    },
  ],
  exports: [StorageProvider],
})
export class StorageModule {}
