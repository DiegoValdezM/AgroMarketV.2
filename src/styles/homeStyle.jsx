import { StyleSheet } from 'react-native';

const homeStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#8a5c9f',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsText: {
    color: '#666',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 1,
  },
  emptyText: {
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#8a5c9f',
    padding: 12,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#f44336',
    textAlign: 'center',
    margin: 20,
  },
});

export default homeStyles;