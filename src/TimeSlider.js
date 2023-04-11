import * as React from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

export default function SliderSizes() {
    return (
        <Box width={300}>
            <Slider
                defaultValue={150}
                aria-label="Default"
                valueLabelDisplay="auto"
                min={100}
                max={200}
            />
        </Box>
    );
}