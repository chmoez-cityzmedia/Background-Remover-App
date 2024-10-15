"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm();
  const { toast } = useToast();

  const onSubmit = async (data: { image: FileList }) => {
    if (data.image.length === 0) {
      toast({
        title: "Error",
        description: "Please select an image to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const file = data.image[0];
    setOriginalImage(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('image_file', file);

    try {
      const response = await axios.post('/api/remove-background', formData, {
        responseType: 'blob',
      });

      const processedImageUrl = URL.createObjectURL(response.data);
      setProcessedImage(processedImageUrl);
      toast({
        title: "Success",
        description: "Background removed successfully!",
        variant: "default"
      });
    } catch (error) {
      console.error('Error removing background:', error);
      let errorMessage = "Failed to remove background. Please try again.";
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.error || errorMessage;
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Advanced Background Remover</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="mb-4">
          <Label htmlFor="image">Upload Image</Label>
          <Input id="image" type="file" accept="image/*" {...register('image')} />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Remove Background'}
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {originalImage && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Original Image</h2>
            <img src={originalImage} alt="Original" className="max-w-full h-auto" />
          </div>
        )}
        {processedImage && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Processed Image</h2>
            <img src={processedImage} alt="Processed" className="max-w-full h-auto" />
            <a href={processedImage} download="processed_image.png" className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded">
              Download Processed Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
}