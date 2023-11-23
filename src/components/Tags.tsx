import React from 'react';
import { UNSAFE_Combobox } from '@navikt/ds-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Feedback } from '../queryhooks/useFeedback';

const fetchAllTags = async (): Promise<string[]> => {
  const response = await fetch('http://localhost:8085/api/v1/intern/feedback/tags/');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const fetchTags = async (id: string): Promise<string[]> => {
  const response = await fetch(`http://localhost:8085/api/v1/intern/feedback/${id}/tags`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const addTag = async (tag: string, id: string): Promise<void> => {
  await fetch(`http://localhost:8085/api/v1/intern/feedback/${id}/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tag }),
  });
};

export const Tags = ({ feedback }: { feedback: Feedback }): JSX.Element => {
  const queryClient = useQueryClient();
  const feedbackId = feedback.id; // Assuming feedback object has an 'id' property

  // Fetch tags for a specific feedback ID
  const { data: selectedTags, isLoading, isError } = useQuery(['selectedTags', feedbackId], () => fetchTags(feedbackId));
    // Fetch all unique tags
// Fetch all unique tags
const { data: allTags, isLoading: isLoadingAllTags, isError: isErrorAllTags } = useQuery(['allTags'], fetchAllTags);

  // Mutation for adding a tag
  const addTagMutation = useMutation((tag: string) => addTag(tag, feedbackId), {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries(['selectedTags', feedbackId]);
      queryClient.invalidateQueries(['allTags']);

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

if (isLoading || isLoadingAllTags) return <div>Loading...</div>;
if (isError || isErrorAllTags) return <div>An error has occurred</div>;
  return (
    <div>
      <UNSAFE_Combobox
        allowNewValues
        label="Hva er dine favorittdrikker? Legg gjerne til flere alternativer."
      options={allTags || []} // Use all fetched tags        isMultiSelect
        selectedOptions={selectedTags || []} // Assuming 'feedback.tags' is an array of selected tags
        onToggleSelected={(option, isSelected) => {
          handleTagToggle(option, isSelected);
        }}
      />
    </div>
  );
};
