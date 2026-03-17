import { Extension } from 'https://esm.sh/@tiptap/core@2.11.5';

const SUPPORTED_TYPES = ['paragraph', 'heading', 'blockquote', 'bulletList', 'orderedList', 'listItem'];

function getDirectionAttrs(element) {
    return element.getAttribute('dir') || element.style.direction || null;
}

export const TextDirection = Extension.create({
    name: 'textDirection',

    addOptions() {
        return {
            types: SUPPORTED_TYPES,
            directions: ['ltr', 'rtl'],
        };
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    dir: {
                        default: null,
                        parseHTML: (element) => getDirectionAttrs(element),
                        renderHTML: (attributes) => {
                            if (!attributes.dir) {
                                return {};
                            }

                            return {
                                dir: attributes.dir,
                                style: `direction: ${attributes.dir}; text-align: inherit`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setTextDirection: (direction) => ({ commands }) => {
                if (!this.options.directions.includes(direction)) {
                    return false;
                }

                return this.options.types.some((type) => commands.updateAttributes(type, { dir: direction }));
            },
            unsetTextDirection: () => ({ commands }) => {
                return this.options.types.some((type) => commands.resetAttributes(type, 'dir'));
            },
        };
    },
});
