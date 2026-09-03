import { useMutation } from '@tanstack/react-query';

import { uploadServiceImage } from '../api/files.actions';

export const useUploadImage = () =>
  useMutation({
    mutationFn: (file: File) => uploadServiceImage(file),
  });
