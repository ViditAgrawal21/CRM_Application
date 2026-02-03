import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import {useMutation} from '@tanstack/react-query';
import Icon from '@react-native-vector-icons/ionicons';
import {useRoute, useNavigation} from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import * as XLSX from 'xlsx';
import {useTheme} from '../hooks/useTheme';
import {Card, Button, LoadingSpinner} from '../components';
import {leadService} from '../services/leadService';
import {BulkUploadRecord, BulkUploadResponse, LeadType} from '../types';

export const BulkUploadScreen: React.FC = () => {
  const {theme} = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const {type = 'lead'} = route.params || {};

  const [records, setRecords] = useState<BulkUploadRecord[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [uploadResult, setUploadResult] = useState<BulkUploadResponse | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (data: {type: LeadType; date: string; records: BulkUploadRecord[]}) =>
      leadService.bulkUpload(data.type, data.date, data.records),
    onSuccess: (result) => {
      setUploadResult(result);
      Alert.alert(
        'Upload Complete',
        `Inserted: ${result.inserted}\nDuplicates: ${result.duplicates}\nErrors: ${result.errors}`,
      );
    },
    onError: (error: any) => {
      Alert.alert('Upload Failed', error.message || 'Something went wrong');
    },
  });

  const pickExcelFile = async () => {
    try {
      const doc = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.xls, DocumentPicker.types.xlsx, DocumentPicker.types.allFiles],
      });

      setFileName(doc.name || 'Selected file');

      // Read file
      const response = await fetch(doc.uri);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target?.result;
          const workbook = XLSX.read(data, {type: 'array'});
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Transform Excel data to API format
          const parsedRecords: BulkUploadRecord[] = jsonData.map((row: any) => ({
            customerName: row['Customer Name'] || row['Name'] || row['name'] || '',
            customerNumber: String(row['Customer Number'] || row['Phone'] || row['phone'] || row['Mobile'] || ''),
            configuration: row['Configuration'] || row['Config'] || row['configuration'] || '',
            location: row['Location'] || row['location'] || row['Area'] || '',
            remark: row['Remark'] || row['remark'] || row['Notes'] || '',
            assignTo: row['Assign To'] || row['assignTo'] || row['Assigned To'] || null,
          }));

          // Filter out empty records
          const validRecords = parsedRecords.filter(
            r => r.customerName && r.customerNumber,
          );

          setRecords(validRecords);
          Alert.alert('File Parsed', `Found ${validRecords.length} valid records`);
        } catch (parseError) {
          Alert.alert('Parse Error', 'Failed to parse Excel file. Please check the format.');
        }
      };

      reader.readAsArrayBuffer(blob);
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled
      } else {
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  };

  const handleUpload = () => {
    if (records.length === 0) {
      Alert.alert('No Records', 'Please select an Excel file first');
      return;
    }

    Alert.alert(
      'Confirm Upload',
      `Upload ${records.length} ${type === 'lead' ? 'leads' : 'data records'}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Upload',
          onPress: () => {
            uploadMutation.mutate({
              type: type as LeadType,
              date: new Date().toISOString().split('T')[0],
              records,
            });
          },
        },
      ],
    );
  };

  const clearRecords = () => {
    setRecords([]);
    setFileName('');
    setUploadResult(null);
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Card>
          <View style={styles.headerRow}>
            <Icon
              name={type === 'lead' ? 'people' : 'document-text'}
              size={32}
              color={theme.colors.primary}
            />
            <View style={{marginLeft: 16, flex: 1}}>
              <Text style={[theme.typography.h3, {color: theme.colors.text}]}>
                Bulk Upload {type === 'lead' ? 'Leads' : 'Data'}
              </Text>
              <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                Upload Excel file with customer records
              </Text>
            </View>
          </View>
        </Card>

        {/* Excel Format Guide */}
        <Card style={{marginTop: 16}}>
          <Text style={[theme.typography.h4, {color: theme.colors.text, marginBottom: 12}]}>
            Excel Format Required
          </Text>
          <View style={[styles.formatBox, {backgroundColor: theme.colors.background}]}>
            <Text style={[theme.typography.caption, {color: theme.colors.textSecondary, fontFamily: 'monospace'}]}>
              | Customer Name | Customer Number | Configuration | Location | Remark |
            </Text>
          </View>
          <Text style={[theme.typography.caption, {color: theme.colors.textSecondary, marginTop: 8}]}>
            * Customer Name and Customer Number are required
          </Text>
        </Card>

        {/* File Picker */}
        <TouchableOpacity
          style={[
            styles.pickerButton,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={pickExcelFile}
          disabled={uploadMutation.isPending}>
          <Icon name="cloud-upload-outline" size={48} color={theme.colors.primary} />
          <Text style={[theme.typography.body1, {color: theme.colors.primary, marginTop: 12}]}>
            {fileName || 'Tap to select Excel file'}
          </Text>
          <Text style={[theme.typography.caption, {color: theme.colors.textSecondary, marginTop: 4}]}>
            Supports .xlsx, .xls files
          </Text>
        </TouchableOpacity>

        {/* Preview Records */}
        {records.length > 0 && (
          <Card style={{marginTop: 16}}>
            <View style={styles.previewHeader}>
              <Text style={[theme.typography.h4, {color: theme.colors.text}]}>
                Preview ({records.length} records)
              </Text>
              <TouchableOpacity onPress={clearRecords}>
                <Icon name="close-circle" size={24} color={theme.colors.error} />
              </TouchableOpacity>
            </View>

            {records.slice(0, 5).map((record, index) => (
              <View
                key={index}
                style={[styles.previewItem, {borderBottomColor: theme.colors.border}]}>
                <Text style={[theme.typography.body2, {color: theme.colors.text}]}>
                  {record.customerName}
                </Text>
                <Text style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                  {record.customerNumber} • {record.configuration || 'N/A'} • {record.location || 'N/A'}
                </Text>
              </View>
            ))}

            {records.length > 5 && (
              <Text style={[theme.typography.caption, {color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8}]}>
                ... and {records.length - 5} more records
              </Text>
            )}
          </Card>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <Card style={{marginTop: 16}}>
            <Text style={[theme.typography.h4, {color: theme.colors.text, marginBottom: 12}]}>
              Upload Result
            </Text>
            
            <View style={styles.resultRow}>
              <Text style={[theme.typography.body2, {color: theme.colors.textSecondary}]}>
                Total Records:
              </Text>
              <Text style={[theme.typography.body1, {color: theme.colors.text}]}>
                {uploadResult.total}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={[theme.typography.body2, {color: theme.colors.success}]}>
                ✓ Inserted:
              </Text>
              <Text style={[theme.typography.body1, {color: theme.colors.success}]}>
                {uploadResult.inserted}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={[theme.typography.body2, {color: theme.colors.warning || '#FF9800'}]}>
                ⚠ Duplicates:
              </Text>
              <Text style={[theme.typography.body1, {color: theme.colors.warning || '#FF9800'}]}>
                {uploadResult.duplicates}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text style={[theme.typography.body2, {color: theme.colors.error}]}>
                ✗ Errors:
              </Text>
              <Text style={[theme.typography.body1, {color: theme.colors.error}]}>
                {uploadResult.errors}
              </Text>
            </View>

            {/* Show error details if any */}
            {uploadResult.errorDetails && uploadResult.errorDetails.length > 0 && (
              <View style={{marginTop: 12}}>
                <Text style={[theme.typography.caption, {color: theme.colors.error, marginBottom: 4}]}>
                  Error Details:
                </Text>
                {uploadResult.errorDetails.slice(0, 3).map((err, idx) => (
                  <Text key={idx} style={[theme.typography.caption, {color: theme.colors.textSecondary}]}>
                    Row {err.recordIndex + 1}: {err.reason}
                  </Text>
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Upload Button */}
        {records.length > 0 && !uploadResult && (
          <Button
            title={`Upload ${records.length} ${type === 'lead' ? 'Leads' : 'Data Records'}`}
            onPress={handleUpload}
            loading={uploadMutation.isPending}
            size="large"
            style={{marginTop: 24}}
          />
        )}

        {/* Done Button after upload */}
        {uploadResult && (
          <Button
            title="Done"
            onPress={() => navigation.goBack()}
            size="large"
            style={{marginTop: 24}}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatBox: {
    padding: 12,
    borderRadius: 8,
    overflow: 'scroll',
  },
  pickerButton: {
    marginTop: 16,
    padding: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});
