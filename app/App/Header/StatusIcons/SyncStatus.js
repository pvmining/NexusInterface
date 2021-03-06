// External Dependencies
import React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

// Internal Global Dependencies
import Text from 'components/Text';
import { animations } from 'styles';
import Tooltip from 'components/Tooltip';
import StatusIcon from 'components/StatusIcon';

import checkIcon from 'images/check.sprite.svg';
import syncingIcon from 'images/syncing.sprite.svg';

const SpinningIcon = styled(StatusIcon)({
  animation: `${animations.spin} 2s linear infinite`,
});

/**
 * Handles the Sync Status
 *
 * @class SyncStatus
 * @extends {React.Component}
 */
@connect(
  ({ overview: { synchronizing, blocks }, common: { heighestPeerBlock } }) => ({
    synchronizing,
    heighestPeerBlock,
    blocks,
  })
)
class SyncStatus extends React.Component {
  statusIcon = () => {
    const { synchronizing, heighestPeerBlock, blocks } = this.props;
    const outOfSyncLegacy = heighestPeerBlock > blocks;

    if (synchronizing || outOfSyncLegacy) {
      return <SpinningIcon icon={syncingIcon} />;
    } else {
      return <StatusIcon icon={checkIcon} />;
    }
  };

  statusTooltip = () => {
    const { synchronizing, heighestPeerBlock, blocks } = this.props;
    const outOfSyncLegacy = heighestPeerBlock > blocks;

    if (synchronizing || outOfSyncLegacy) {
      return (
        <Text
          id="Header.Syncing"
          // data={{ blocks: heighestPeerBlock - blocks }}
        />
      );
    } else {
      return <Text id="Header.Synced" />;
    }
  };

  render() {
    return (
      <Tooltip.Trigger tooltip={this.statusTooltip()}>
        {this.statusIcon()}
      </Tooltip.Trigger>
    );
  }
}
export default SyncStatus;
