import { UNSAFE_Combobox } from "@navikt/ds-react";

interface TagFilterProps {
  initialOptions: string[];
  selectedTags: string[];
  setSelectedTags: (newTags: string[]) => void;
}

export const TagFilter = ({ initialOptions, selectedTags, setSelectedTags }: TagFilterProps): JSX.Element => {

    const handleToggleSelected = (option: string | undefined, isSelected: boolean) : void => {
    if (!option) return;

    let newSelectedTags;
    if (isSelected) {
      if (!selectedTags.includes(option)) {
        newSelectedTags = [...selectedTags, option];
      } else {
        return;
      }
    } else {
      newSelectedTags = selectedTags.filter(tag => tag !== option);
    }

    if (newSelectedTags && newSelectedTags.length !== selectedTags.length) {
      setSelectedTags(newSelectedTags);
    }
  };

  return (
    <div>
      <UNSAFE_Combobox
        label="Filter?"
        options={initialOptions}
        isMultiSelect
        onToggleSelected={handleToggleSelected}
      />
    </div>
  );
};
