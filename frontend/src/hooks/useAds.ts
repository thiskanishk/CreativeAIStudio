import { useQuery, useMutation, useQueryClient } from 'react-query';
import adService, { AdData, AdCreationInput } from '../api/services/adService';
import { toast } from 'react-toastify';

export function useAds() {
  const queryClient = useQueryClient();

  // Get all ads
  const {
    data: ads,
    isLoading: isLoadingAds,
    error: adsError,
    refetch: refetchAds,
  } = useQuery('ads', () => adService.getAds(), {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get a specific ad
  const useAd = (id: string) => {
    return useQuery(['ad', id], () => adService.getAd(id), {
      enabled: !!id,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  // Create new ad
  const createAdMutation = useMutation(
    ({data, mediaFile}: {data: AdCreationInput, mediaFile: File}) => 
      adService.createAd(data, mediaFile),
    {
      onSuccess: (newAd) => {
        // Update the ads cache
        queryClient.invalidateQueries('ads');
        toast.success('Ad created successfully!');
        return newAd;
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to create ad');
        return error;
      },
    }
  );

  // Update ad
  const updateAdMutation = useMutation(
    ({id, data, mediaFile}: {id: string, data: Partial<AdCreationInput>, mediaFile?: File}) => 
      adService.updateAd(id, data, mediaFile),
    {
      onSuccess: (updatedAd) => {
        // Update the ads cache
        queryClient.invalidateQueries('ads');
        queryClient.invalidateQueries(['ad', updatedAd.id]);
        toast.success('Ad updated successfully!');
        return updatedAd;
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to update ad');
        return error;
      },
    }
  );

  // Delete ad
  const deleteAdMutation = useMutation(
    (id: string) => adService.deleteAd(id),
    {
      onSuccess: (_, id) => {
        // Update the ads cache
        queryClient.invalidateQueries('ads');
        queryClient.removeQueries(['ad', id]);
        toast.success('Ad deleted successfully!');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to delete ad');
        return error;
      },
    }
  );

  // Generate variations
  const generateVariationsMutation = useMutation(
    ({id, count}: {id: string, count?: number}) => adService.generateVariations(id, count),
    {
      onSuccess: (variations, {id}) => {
        // Update the specific ad cache
        queryClient.invalidateQueries(['ad', id]);
        toast.success('Ad variations generated successfully!');
        return variations;
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to generate variations');
        return error;
      },
    }
  );

  // Download ad
  const downloadAdMutation = useMutation(
    (id: string) => adService.downloadAd(id),
    {
      onSuccess: (blob, id) => {
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ad-${id}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        toast.success('Ad downloaded successfully!');
        return blob;
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to download ad');
        return error;
      },
    }
  );

  // Share ad
  const shareAdMutation = useMutation(
    (id: string) => adService.shareAd(id),
    {
      onSuccess: (result) => {
        // Copy share URL to clipboard
        navigator.clipboard.writeText(result.shareUrl);
        toast.success('Share link copied to clipboard!');
        return result;
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to share ad');
        return error;
      },
    }
  );

  return {
    // Queries
    ads,
    isLoadingAds,
    adsError,
    refetchAds,
    useAd,
    
    // Mutations
    createAd: createAdMutation.mutateAsync,
    isCreatingAd: createAdMutation.isLoading,
    
    updateAd: updateAdMutation.mutateAsync,
    isUpdatingAd: updateAdMutation.isLoading,
    
    deleteAd: deleteAdMutation.mutateAsync,
    isDeletingAd: deleteAdMutation.isLoading,
    
    generateVariations: generateVariationsMutation.mutateAsync,
    isGeneratingVariations: generateVariationsMutation.isLoading,
    
    downloadAd: downloadAdMutation.mutateAsync,
    isDownloadingAd: downloadAdMutation.isLoading,
    
    shareAd: shareAdMutation.mutateAsync,
    isSharingAd: shareAdMutation.isLoading,
  };
} 