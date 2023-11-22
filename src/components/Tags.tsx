import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { UNSAFE_Combobox } from '@navikt/ds-react';

import { Feedback } from '../queryhooks/useFeedback';

// API interaction functions
const fetchTags = async (): Promise<string[]> => {
  const response = await fetch('/api/v1/intern/feedback/tags');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const addTag = async (tag: string): Promise<void> => {
  await fetch('/api/v1/intern/feedback/:id/tags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tag }),
  });
};

export const Tags = ({ feedback }: { feedback: Feedback }): JSX.Element => {
  const queryClient = useQueryClient();

  // Fetch tags using React Query
  const { data: tags, isLoading, isError } = useQuery('tags', fetchTags);

  // Mutation for adding a tag
  const addTagMutation = useMutation(addTag, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries('tags');
    },
  });

  // Handle tag toggle
  const handleTagToggle = (tag: string, isSelected: boolean): void => {
    if (isSelected) {
      addTagMutation.mutate(tag);
    } else {
      // Handle tag removal logic
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>An error has occurred</div>;

  return (
    <div>
      <UNSAFE_Combobox
        allowNewValues
        label="Hva er dine favorittdrikker? Legg gjerne til flere alternativer."
        options={tags || []} // Use fetched tags
        isMultiSelect
        selectedOptions={feedback.tags} // Assuming 'feedback.tags' is an array of selected tags
        onToggleSelected={(option, isSelected) => {
          handleTagToggle(option, isSelected);
        }}
      />
    </div>
  );
};
