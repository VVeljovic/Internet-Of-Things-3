import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { io } from 'socket.io-client';

const SERVER = 'http://192.168.1.4:5000';

interface Data {
  x: number;
  y: number;
  z: number;
  orientation: string;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA94D', '#A29BFE'];

const App = () => {
  const [data, setData] = useState<Data[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (message: string) => {
    setToast(message);
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(toastOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setToast(null));
  };

  useEffect(() => {
    fetch(`${SERVER}/data`)
      .then(response => response.json())
      .then((json: Data[]) => setData(json))
      .catch(error => console.error(error));

    const socket = io(SERVER);

    socket.on('connect', () => console.log('Socket connected'));

    socket.on('new-data', (incoming: string) => {
      showToast(`Novo obaveštenje: ${incoming}`);
    });

    return () => { socket.disconnect(); };
  }, []);

  const chartData = Object.entries(
    data.reduce<Record<string, number>>((acc, item) => {
      acc[item.orientation] = (acc[item.orientation] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([orientation, count], i) => ({
    value: count,
    label: orientation,
    frontColor: COLORS[i % COLORS.length],
  }));

  const maxValue = Math.max(...chartData.map(d => d.value), 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Raspored položaja</Text>

      {toast && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      )}

      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          barWidth={60}
          spacing={30}
          barBorderRadius={6}
          showGradient
          yAxisThickness={0}
          xAxisType={'dashed'}
          xAxisColor={'lightgray'}
          yAxisTextStyle={{ color: 'lightgray' }}
          stepValue={1}
          maxValue={maxValue || 1}
          noOfSections={6}
          labelWidth={80}
          xAxisLabelTextStyle={{ color: 'lightgray', textAlign: 'center', fontSize: 11 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#232B5D',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    paddingTop: 10,
  },
  toast: {
    backgroundColor: '#4ECDC4',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  toastText: {
    color: '#232B5D',
    fontWeight: 'bold',
    fontSize: 13,
  },
});

export default App;
