import ContentEditFeatureSettings from './ContentEditFeatureSettings';
import { AutoLinkFeatures } from './features/autoLinkFeatures';
import { CursorFeatures } from './features/cursorFeatures';
import { EntityFeatures } from './features/entityFeatures';
import { GenericContentEditFeature } from 'roosterjs-editor-types';
import { ListFeatures } from './features/listFeatures';
import { MarkdownFeatures } from './features/markdownFeatures';
import { PluginEvent } from 'roosterjs-editor-types';
import { QuoteFeatures } from './features/quoteFeatures';
import { ShortcutFeatures } from './features/shortcutFeatures';
import { StructuredNodeFeatures } from './features/structuredNodeFeatures';
import { TableFeatures } from './features/tableFeatures';

const allFeatures = {
    ...ListFeatures,
    ...QuoteFeatures,
    ...TableFeatures,
    ...StructuredNodeFeatures,
    ...AutoLinkFeatures,
    ...ShortcutFeatures,
    ...CursorFeatures,
    ...MarkdownFeatures,
    ...EntityFeatures,
};

/**
 * Get all content edit features
 */
export function getAllContentEditFeatures(): Record<
    keyof ContentEditFeatureSettings,
    GenericContentEditFeature<PluginEvent>
> {
    return allFeatures;
}

/**
 * Get default content editing features for editor
 */
export default function getContentEditFeatures(
    settingsOverride?: Partial<ContentEditFeatureSettings>,
    additionalFeatures?: GenericContentEditFeature<PluginEvent>[]
): GenericContentEditFeature<PluginEvent>[] {
    const features: GenericContentEditFeature<PluginEvent>[] = [];

    Object.keys(allFeatures).forEach((key: keyof typeof allFeatures) => {
        const feature = allFeatures[key];
        const hasSettingForKey = settingsOverride && settingsOverride[key] !== undefined;

        if (
            (hasSettingForKey && settingsOverride[key]) ||
            (!hasSettingForKey && !feature.defaultDisabled)
        ) {
            features.push(feature);
        }
    });

    return features.concat(additionalFeatures || []);
}
