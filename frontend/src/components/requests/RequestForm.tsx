import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES, CATEGORY_LABELS } from '@/lib/constants';
import type { Category, RequestInput } from '@/types';

export const requestFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'O título deve ter ao menos 3 caracteres')
    .max(120, 'O título deve ter no máximo 120 caracteres'),
  description: z
    .string()
    .trim()
    .min(5, 'A descrição deve ter ao menos 5 caracteres')
    .max(5000, 'A descrição deve ter no máximo 5000 caracteres'),
  category: z.enum(CATEGORIES as [Category, ...Category[]], {
    errorMap: () => ({ message: 'Selecione uma categoria' }),
  }),
});

interface Props {
  defaultValues?: Partial<RequestInput>;
  submitLabel: string;
  onSubmit: (values: RequestInput) => Promise<void>;
  onCancel: () => void;
}

export function RequestForm({ defaultValues, submitLabel, onSubmit, onCancel }: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestInput>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: { title: '', description: '', ...defaultValues } as RequestInput,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" maxLength={120} placeholder="Resumo da solicitação" {...register('title')} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select value={field.value ?? ''} onValueChange={field.onChange}>
              <SelectTrigger id="category" aria-label="Categoria" onBlur={field.onBlur}>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          rows={6}
          placeholder="Descreva a demanda com o máximo de detalhes"
          {...register('description')}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
