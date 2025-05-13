import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { breakpoints } from './styling/breakpoints';
const config = defineConfig({
    disableLayers: true,
    theme: {
        breakpoints,
        tokens: {
            fonts: {
                body: { value: 'Montserrat, sans-serif' },
                heading: { value: 'Oswald, sans-serif' },
                arial: { value: "'Arial', sans-serif" },
            },
        },
    },
});
const customTheme = createSystem(defaultConfig, config);
export default customTheme;