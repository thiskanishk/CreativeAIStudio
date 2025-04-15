import { useQuery, useMutation, useQueryClient, UseQueryResult } from 'react-query';
import { useCallback, useMemo } from 'react';
import adService, { AdData, AdCreationInput } from '../api/services/adService';
import { toast } from 'react-toastify';

// Types for API errors
interface ApiError {
  message: string;
  statusCode?: number;
  details?: unknown;
}

// Custom error formatter for consistent error handling 
const formatError = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') return error.message;
    if ('error' in error && typeof error.error === 'string') return error.error;
  }
  return 'An unexpected error occurred';
};

export function useAds() {
  const queryClient = useQueryClient();
  
  // Cache configurations
  const defaultCacheTime = 10 * 60 * 1000; // 10 minutes
  const defaultStaleTime = 5 * 60 * 1000; // 5 minutes
  
  // Query key factory functions for consistency
  const adsQueryKey = useMemo(() => ['ads'], []);
  const adQueryKey = useCallback((id: string) => ['ad', id], []);

  // Get all ads with optimized configuration
  const {
    data: ads,
    isLoading: isLoadingAds,
    error: adsError,
    refetch: refetchAds,
  } = useQuery(adsQueryKey, () => adService.getAds(), {
    staleTime: defaultStaleTime,
    cacheTime: defaultCacheTime,
    retry: 2,
    onError: (error: unknown) => {
      toast.error(formatError(error));
    },
  });

  // Get a specific ad - optimized to be reused throughout the app
  const useAd = useCallback((id: string): UseQueryResult<AdData, unknown> => {
    return useQuery(adQueryKey(id), () => adService.getAd(id), {
      enabled: !!id,
      staleTime: defaultStaleTime,
      cacheTime: defaultCacheTime,
      retry: 2,
      onError: (error: unknown) => {
        toast.error(`Error fetching ad: ${formatError(error)}`);
      },
    });
  }, [adQueryKey, defaultStaleTime, defaultCacheTime]);

  // Create new ad - with improved error handling and types
  const createAdMutation = useMutation<
    AdData, 
    ApiError, 
    {data: AdCreationInput, mediaFile: File}
  >(
    ['createAd'],
    ({data, mediaFile}) => adService.createAd(data, mediaFile),
    {
      onSuccess: (newAd) => {
        // Update the ads cache
        queryClient.invalidateQueries(adsQueryKey);
        toast.success('Ad created successfully!');
      },
      onError: (error) => {
        toast.error(formatError(error));
      },
    }
  );

  // Update ad - with improved error handling and types
  const updateAdMutation = useMutation<
    AdData, 
    ApiError, 
    {id: string, data: Partial<AdCreationInput>, mediaFile?: File}
  >(
    ['updateAd'],
    ({id, data, mediaFile}) => adService.updateAd(id, data, mediaFile),
    {
      onSuccess: (updatedAd) => {
        // Update the ads cache
        queryClient.invalidateQueries(adsQueryKey);
        queryClient.invalidateQueries(adQueryKey(updatedAd.id));
        toast.success('Ad updated successfully!');
      },
      onError: (error) => {
        toast.error(formatError(error));
      },
    }
  );

  // Delete ad - with improved error handling and types
  const deleteAdMutation = useMutation<
    void, 
    ApiError, 
    string
  >(
    ['deleteAd'],
    (id) => adService.deleteAd(id),
    {
      onSuccess: (_, id) => {
        // Update the ads cache
        queryClient.invalidateQueries(adsQueryKey);
        queryClient.removeQueries(adQueryKey(id));
        toast.success('Ad deleted successfully!');
      },
      onError: (error) => {
        toast.error(formatError(error));
      },
    }
  );

  // Generate variations - with improved error handling and types
  const generateVariationsMutation = useMutation<
    AdData[], 
    ApiError, 
    {id: string, count?: number}
  >(
    ['generateVariations'],
    ({id, count}) => adService.generateVariations(id, count),
    {
      onSuccess: (variations, {id}) => {
        // Update the specific ad cache
        queryClient.invalidateQueries(adQueryKey(id));
        toast.success('Ad variations generated successfully!');
      },
      onError: (error) => {
        toast.error(formatError(error));
      },
    }
  );

  // Download ad - with improved error handling and types
  const downloadAdMutation = useMutation<
    Blob, 
    ApiError, 
    string
  >(
    ['downloadAd'],
    (id) => adService.downloadAd(id),
    {
      onSuccess: (blob, id) => {
        try {
          // Create a download link
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ad-${id}.png`;
          document.body.appendChild(a);
          a.click();
          
          // Cleanup
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
            a.remove();
          }, 100);
          
          toast.success('Ad downloaded successfully!');
        } catch (err) {
          console.error('Error processing download:', err);
          toast.error('Download failed');
          throw err;
        }
      },
      onError: (error) => {
        toast.error(formatError(error));
      },
    }
  );

  // Share ad - with improved error handling and types
  const shareAdMutation = useMutation<
    {shareUrl: string}, 
    ApiError, 
    string
  >(
    ['shareAd'],
    (id) => adService.shareAd(id),
    {
      onSuccess: (result) => {
        try {
          // Copy share URL to clipboard
          navigator.clipboard.writeText(result.shareUrl);
          toast.success('Share link copied to clipboard!');
        } catch (err) {
          console.error('Error copying to clipboard:', err);
          toast.warning('Could not copy to clipboard automatically. URL: ' + result.shareUrl);
        }
      },
      onError: (error) => {
        toast.error(formatError(error));
      },
    }
  );

  // Memoize the returned object to prevent unnecessary rerenders of components that use this hook
  return useMemo(() => ({
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
  }), [
    ads,
    isLoadingAds,
    adsError,
    refetchAds,
    useAd,
    createAdMutation.mutateAsync,
    createAdMutation.isLoading,
    updateAdMutation.mutateAsync,
    updateAdMutation.isLoading,
    deleteAdMutation.mutateAsync,
    deleteAdMutation.isLoading,
    generateVariationsMutation.mutateAsync,
    generateVariationsMutation.isLoading,
    downloadAdMutation.mutateAsync,
    downloadAdMutation.isLoading,
    shareAdMutation.mutateAsync,
    shareAdMutation.isLoading,
  ]);
} 