import { supabase } from './client';
import type { QualityAssessmentResponse } from '../../types/lot';
import { apiRequest } from '../apiClient';

export const qualityService = {
  /**
   * Uploads 1-2 produce images to Supabase storage.
   */
  uploadImages: async (farmerId: string, lotId: string, files: File[]): Promise<string[]> => {
    const uploadedPaths: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      // produce-images/{farmer_id}/{lot_id}/{uuid}.jpg
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${farmerId}/${lotId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('produce-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Image upload error:', error);
        throw new Error('Your photo could not be uploaded. Please try again.');
      }

      uploadedPaths.push(data.path);
    }

    return uploadedPaths;
  },

  /**
   * Validates the image before assessment.
   * Basic validation for prototype (e.g. size/type). 
   */
  validateImages: (files: File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = files.filter(f => f !== null);
    if (validFiles.length === 0) {
      throw new Error('Please upload at least one clear photo of your produce.');
    }

    validFiles.forEach(file => {
      if (!validTypes.includes(file.type)) {
        throw new Error('This photo format isn\'t supported. Please use JPG, PNG, or WEBP.');
      }
      if (file.size > maxSize) {
        throw new Error('Photo is too large. Please upload an image smaller than 10MB.');
      }
    });
  },

  /** Uploads files, then lets the authenticated API persist and orchestrate assessment/matching. */
  assessProduce: async (
    farmerId: string, 
    lotId: string, 
    _crop: string,
    files: File[]
  ): Promise<QualityAssessmentResponse> => {
    
    // 1. Validate
    qualityService.validateImages(files);

    // 2. Upload
    let storagePaths: string[] = [];
    try {
      storagePaths = await qualityService.uploadImages(farmerId, lotId, files);
    } catch (err: any) {
      throw new Error(err.message || 'Storage upload failed.');
    }

    return apiRequest<QualityAssessmentResponse>(`/quality/lots/${lotId}/assessment`, {
      method: 'POST',
      body: JSON.stringify({ image_paths: storagePaths }),
    });
  }
};
