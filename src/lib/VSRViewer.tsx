import React from 'react';
import { SingleEliminationBracket, Match, createTheme    } from '@g-loot/react-tournament-brackets';
import SvgViewer  from './SVGViewer';

const vsrTheme = createTheme({
  textColor: { 
    main: '#ffffff', // theme_font_color_base
    highlighted: '#ffffff', // theme_font_color_dark
    dark: '#ffffff', // color_tertiary_500
  },
  matchBackground: { 
    wonColor: '#262626', // color_success_500
    lostColor: '#1d1d1d', // color_warning_500
  },
  score: {
    background: { 
      wonColor: '#1d1d1d', // color_success_500
      lostColor: '#1d1d1d', // color_warning_500
    },
    text: { 
      highlightedWonColor: '#77b814', // color_primary_50
      highlightedLostColor: '#e15e9f', // color_error_50
    },
  },
  border: {
    color: '#262626', // color_primary_800
    highlightedColor: '#262626', // color_secondary_400
  },
  roundHeader: { 
    backgroundColor: '#000000', // color_secondary_400
    fontColor: '#ffffff', // theme_font_color_base
  },
  connectorColor: '#222222', // color_primary_800
  connectorColorHighlight: '#fcee4f', // color_secondary_400
  svgBackground: '#131313', // color_surface_500
});

// const event = new CustomEvent('yourCustomEvent', {
//   detail: {
//     test: 'test',
//   }
// });



interface VSRViewerProps {
  matches: unknown[];
  width: number;
  height: number;
}

export const VSRViewer: React.FC<VSRViewerProps> = ({ matches, width, height }) => {

  const emitPartyClick = (playerId: number, matchId: number) => {
    const event = new CustomEvent('partyClick', {
      detail: {
        partyId: playerId,
        matchId,
      }
    });
    window.dispatchEvent(event);
  }


  return (
    <SingleEliminationBracket
      matches={matches}
      theme={vsrTheme}
      onMatchClick={(matchId: number) => {
        const event = new CustomEvent('matchClick', {
          detail: {
            matchId,
          }
        });
        window.dispatchEvent(event);
      }
      }
      options={{
        style: {
          roundHeader: {
            isShown: true,
            backgroundColor: "#000000",
            fontColor: vsrTheme.roundHeader.fontColor,
            fontFamily: 'Space',
          },
          connectorColor: vsrTheme.connectorColor,
          connectorColorHighlight: vsrTheme.connectorColorHighlight,
        },
      }}
      svgWrapper={({ children, ...props }) => (
        <SvgViewer
        background={vsrTheme.svgBackground}
        customMiniature={() => null}
        SVGBackground={vsrTheme.svgBackground}
          width={width}
          height={height}
          {...props}
        >
          {children}
        </SvgViewer>
      )}
      matchComponent={({
        match,
        onMatchClick,
        onPartyClick,
        onMouseEnter,
        onMouseLeave,
        topParty,
        bottomParty,
        topWon,
        bottomWon,
        topHovered,
        bottomHovered,
        topText,
        bottomText,
        connectorColor,
        computedStyles,
        teamNameFallback,
        resultFallback,
      }) => (
        <div>
          <span
          style={{
            marginBottom: '2px',
            marginLeft: '2px',

            // if either top or bottom won then set text to #676767

            color: topWon || bottomWon ? '#676767' : '#ffffff',
          }}
          >

        {topText ?? ""}
          </span>
<div
  style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignContent: 'center',
    color: '#FFFFFF',
    width: '100%',
    height: '100%',
    border: `2px solid ${connectorColor}`,
    borderRadius: '4px',
    fontWeight: '500',
  }}
  id={match.id}
  // onClick={() => onMatchClick(match.id)}
>

 
  <div
    onMouseEnter={() => onMouseEnter(topParty.id)}
    style={{ 
      display: 'flex',
      color: topParty.name === "TBD" ? '#676767' : (topWon ? '#e3d647' : (bottomWon ? '#676767' : '')),
      paddingBottom: '8px',
      paddingTop: '8px',
    }}
  >
    <div style={{ width: '100%', paddingLeft: "8px", }}>
      
      {topParty.name.slice(0,20)} 
      {topParty.name.length > 20 ? '...' : ''}
    </div>
    <div style={{ paddingRight: '8px' }}>
      {topParty.resultText ?? resultFallback(topParty)}
    </div>
  </div>
  <div
    style={{ height: '1px', width: '100%', 
    
    // background: '#262626'
    background: topHovered || bottomHovered ? '#fcee4f' : '#262626'
  
  
  }}
  />
  <div
    onMouseEnter={() => onMouseEnter(bottomParty.id)}
    style={{ 
      display: 'flex',
      justifyContent: 'space-between',
      color: bottomParty.name === "TBD" ? '#676767' : (bottomWon ? '#e3d647' : (topWon ? '#676767' : '')),
      paddingBottom: '7px',
      paddingTop: '7px',
    }}
  >
    <div style={{ paddingLeft: "8px" }}>
      {bottomParty.name.slice(0,20)} 
      {bottomParty.name.length > 20 ? '...' : ''}

    </div>

    <div style={{ paddingRight: '8px' }}>
      {bottomParty.resultText ?? resultFallback(topParty)}
    </div>
  </div>
</div>

</div>
      )}
    />
  );
};
