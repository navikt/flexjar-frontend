import { UNSAFE_Combobox } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'

interface TagFilterProps {
    initialOptions: string[]
    selectedTags: string[]
    setSelectedTags: (newTags: string[]) => void
    setPage: (value: string | ((old: string) => string | null) | null) => Promise<URLSearchParams>
}

export const TagFilter = ({ initialOptions, selectedTags, setSelectedTags, setPage }: TagFilterProps): JSX.Element => {
    const handleToggleSelected = async (option: string | undefined, isSelected: boolean): Promise<void> => {
        if (!option) return

        if (isSelected && !selectedTags.includes(option)) {
            setSelectedTags([...selectedTags, option])
        } else {
            setSelectedTags(selectedTags.filter((tag) => tag !== option))
        }

        try {
            await setPage('1')
        } catch (error) {
            logger.warn('Failed to set page:', error)
        }
    }

    return (
        <div>
            <UNSAFE_Combobox
                size="small"
                label="Tag"
                options={initialOptions.sort()}
                isMultiSelect
                selectedOptions={selectedTags}
                onToggleSelected={handleToggleSelected}
            />
        </div>
    )
}

export default TagFilter
