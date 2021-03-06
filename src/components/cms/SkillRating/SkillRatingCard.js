// Packages
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import skillActions from '../../../redux/actions/skill';
import uiActions from '../../../redux/actions/ui';
import styled from 'styled-components';
import isMobileView from '../../../utils/isMobileView';

// Components
import {
  BarChart,
  Cell,
  LabelList,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Paper as _Paper } from '../../shared/Container';
import {
  SubTitle,
  Title,
  DefaultMessage,
  LargeText,
} from '../../shared/Typography';
import LineChart from '../../shared/charts/LineChart';

const Paper = styled(_Paper)`
  width: 100%;
`;

const Container = styled.div`
  @media (max-width: 500px) {
    width: 100%;
    overflow: auto;
  }
`;

const RatingTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 3rem;
`;

const TimeChartContainer = styled.div`
  margin: 1rem;
  padding: 1.25rem;
  display: flex;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  flex-direction: column;
  align-items: flex-start;
  @media (max-width: 500px) {
    margin: 0rem;
    padding: 0rem;
    overflow: auto;
    width: 100%;
  }
`;

const RatingSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin: 1.5rem;
  @media (max-width: 500px) {
    margin: 0rem;
  }
`;

class SkillRatingCard extends Component {
  static propTypes = {
    skillTag: PropTypes.string,
    skillRatings: PropTypes.object,
    language: PropTypes.string,
    group: PropTypes.string,
    ratingsOverTime: PropTypes.array,
    userRating: PropTypes.number,
    actions: PropTypes.object,
    accessToken: PropTypes.string,
  };

  state = {
    chartWidth: 0,
    ratingsOverTimeWidth: 0,
    offset: 0,
  };

  changeRating = async (userRating) => {
    const { group, language, skillTag: skill, actions } = this.props;
    const skillData = {
      model: 'general',
      group,
      language,
      skill,
      stars: userRating,
    };
    try {
      await actions.setUserRating({ userRating: userRating });
      actions.openSnackBar({
        snackBarMessage: 'The skill was successfully rated!',
        snackBarDuration: 4000,
      });
      try {
        await actions.getSkillRating(skillData);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  componentDidMount = () => {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.updateWindowDimensions);
  };

  updateWindowDimensions = () => {
    const windowWidth = window.innerWidth;
    this.setState({
      chartWidth: windowWidth * 0.8 > 500 ? 400 : windowWidth * 0.8,
      ratingsOverTimeWidth: windowWidth * 0.8 > 800 ? 800 : windowWidth * 0.8,
      /* eslint-disable no-nested-ternary */
      offset:
        windowWidth * 0.8 > 500
          ? 305
          : windowWidth > 400
          ? windowWidth * 0.6
          : windowWidth * 0.55,
      /* eslint-enable no-nested-ternary */
    });
  };

  roundOffRating = (ratingsOverTime) => {
    ratingsOverTime = ratingsOverTime.map((obj) => {
      return { ...obj, rating: parseFloat(obj.rating.toFixed(1)) };
    });
    return ratingsOverTime;
  };

  render() {
    const { chartWidth, ratingsOverTimeWidth, offset } = this.state;
    const { skillRatings, ratingsOverTime } = this.props;
    const ratingsData = [
      { name: '5.0 ⭐', value: parseInt(skillRatings.fiveStar, 10) || 0 },
      { name: '4.0 ⭐', value: parseInt(skillRatings.fourStar, 10) || 0 },
      { name: '3.0 ⭐', value: parseInt(skillRatings.threeStar, 10) || 0 },
      { name: '2.0 ⭐', value: parseInt(skillRatings.twoStar, 10) || 0 },
      { name: '1.0 ⭐', value: parseInt(skillRatings.oneStar, 10) || 0 },
    ];
    const mobileView = isMobileView();
    return (
      <div>
        <Paper>
          <Title>Ratings</Title>
          {skillRatings.totalStar ? (
            <RatingSection>
              <RatingTextContainer>
                <LargeText>
                  {parseFloat(skillRatings.avgStar.toFixed(2)) || 0}
                </LargeText>
                Average Rating
              </RatingTextContainer>
              <div
                style={{
                  flex: 3,
                  margin: '16px 32px 16px 16px',
                  padding: '20px',
                }}
              >
                <ResponsiveContainer width={chartWidth} height={200}>
                  <BarChart
                    layout="vertical"
                    margin={{ right: 48 }}
                    data={ratingsData}
                  >
                    <XAxis type="number" hide={true} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={false}
                      wrapperStyle={{
                        height: '30px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    />
                    <Bar
                      name="Skill Rating"
                      background={true}
                      barSize={32}
                      maxBarSize={100}
                      dataKey="value"
                    >
                      <LabelList
                        position="insideLeft"
                        offset={offset}
                        fill="#666666"
                      />
                      {ratingsData &&
                        Array.isArray(ratingsData) &&
                        ratingsData.length > 0 &&
                        ratingsData.map((entry, index) => (
                          <Cell
                            key={index}
                            fill={
                              [
                                '#81C784',
                                '#AED581',
                                '#FFF176',
                                '#FFB74D',
                                '#E57373',
                              ][index % 5]
                            }
                          />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <RatingTextContainer>
                <LargeText>{skillRatings.totalStar || 0}</LargeText>
                Total Ratings
              </RatingTextContainer>
              <TimeChartContainer>
                <SubTitle>Rating over time</SubTitle>
                {ratingsOverTime.length ? (
                  <Container>
                    <LineChart
                      width={mobileView ? 600 : ratingsOverTimeWidth}
                      data={this.roundOffRating(ratingsOverTime)}
                      legend={'Average rating'}
                      yAxisProps={{
                        domain: [0, 5],
                        ticks: [0, 1, 2, 3, 4, 5],
                        type: 'number',
                        dataKey: 'rating',
                      }}
                      lineKey={'rating'}
                    />
                  </Container>
                ) : (
                  <div>No ratings data over time is present.</div>
                )}
              </TimeChartContainer>
            </RatingSection>
          ) : (
            <DefaultMessage>
              No ratings data available yet, be the first to rate this skill!
            </DefaultMessage>
          )}
        </Paper>
      </div>
    );
  }
}

function mapStateToProps(store) {
  return {
    language: store.skill.metaData.language,
    group: store.skill.metaData.group,
    skillTag: store.skill.metaData.skillTag,
    skillRatings: store.skill.metaData.skillRatings,
    ratingsOverTime: store.skill.ratingsOverTime,
    userRating: store.skill.userRating,
    accessToken: store.app.accessToken,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...uiActions, ...skillActions }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SkillRatingCard);
