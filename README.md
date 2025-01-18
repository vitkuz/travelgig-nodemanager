# Page Manager - DynamoDB Migration Guide

## Current Data Structure
The application currently uses localStorage to store pages and their associated nodes. The data structure consists of:

```typescript
interface Page {
  id: string;
  title: string;
  isPublished: boolean;
  nodes: Node[];
}

interface Node {
  id: string;
  title: string;
  description: string;
  pageId: string;
  prompt?: string;
  generatedImages?: string[];
  predictionId?: string;
  predictionStatus?: string;
}
```

## Proposed DynamoDB Table Design

### Table: PageManager

Using a single table design with composite keys to efficiently support all access patterns:

#### Primary Key Structure
- Partition Key (PK): `string` - Entity type and ID (e.g., "PAGE#123", "NODE#456")
- Sort Key (SK): `string` - Hierarchical data (e.g., "META#", "NODE#789")

#### Global Secondary Indexes (GSIs)

1. **PublishedPagesIndex**
   - PK: `isPublished` (boolean)
   - SK: `createdAt` (string)
   Purpose: Efficiently query all published pages

2. **PageNodesIndex**
   - PK: `pageId` (string)
   - SK: `createdAt` (string)
   Purpose: Efficiently query all nodes for a specific page

#### Example Item Structures

```javascript
// Page Item
{
  PK: "PAGE#uuid1",
  SK: "META#",
  id: "uuid1",
  title: "My Page",
  isPublished: true,
  createdAt: "2024-03-15T12:00:00Z",
  updatedAt: "2024-03-15T12:00:00Z",
  type: "page"
}

// Node Item
{
  PK: "PAGE#uuid1",
  SK: "NODE#uuid2",
  id: "uuid2",
  pageId: "uuid1",
  title: "My Node",
  description: "Node description",
  prompt: "Image generation prompt",
  generatedImages: ["url1", "url2"],
  predictionId: "pred123",
  predictionStatus: "succeeded",
  createdAt: "2024-03-15T12:00:00Z",
  updatedAt: "2024-03-15T12:00:00Z",
  type: "node"
}
```

## Migration Strategy

1. **Create DynamoDB Service Layer**

```typescript
// src/services/dynamodb.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

export class DynamoDBService {
  private readonly client: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    const dbClient = new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    this.client = DynamoDBDocumentClient.from(dbClient);
    this.tableName = process.env.DYNAMODB_TABLE_NAME!;
  }

  async getPage(id: string) {
    const result = await this.client.send(new GetCommand({
      TableName: this.tableName,
      Key: {
        PK: `PAGE#${id}`,
        SK: "META#"
      }
    }));
    return result.Item;
  }

  async getPageNodes(pageId: string) {
    const result = await this.client.send(new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `PAGE#${pageId}`,
        ":sk": "NODE#"
      }
    }));
    return result.Items;
  }

  async createPage(page: Page) {
    await this.client.send(new PutCommand({
      TableName: this.tableName,
      Item: {
        PK: `PAGE#${page.id}`,
        SK: "META#",
        ...page,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: "page"
      }
    }));
  }

  async createNode(node: Node) {
    await this.client.send(new PutCommand({
      TableName: this.tableName,
      Item: {
        PK: `PAGE#${node.pageId}`,
        SK: `NODE#${node.id}`,
        ...node,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: "node"
      }
    }));
  }
}
```

2. **Update PageContext to Use DynamoDB**

```typescript
// src/context/PageContext.tsx
export function PageProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<Page[]>([]);
  const dynamoDb = useMemo(() => new DynamoDBService(), []);

  // Load pages on mount
  useEffect(() => {
    const loadPages = async () => {
      // Implementation to load pages from DynamoDB
    };
    loadPages();
  }, []);

  const addPage = async (title: string) => {
    const newPage: Page = {
      id: uuidv4(),
      title,
      nodes: [],
      isPublished: false,
    };
    await dynamoDb.createPage(newPage);
    setPages(prev => [...prev, newPage]);
    return newPage;
  };

  // ... implement other methods
}
```

## Required AWS Setup

1. Create DynamoDB table:
```bash
aws dynamodb create-table \
  --table-name PageManager \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
    AttributeName=isPublished,AttributeType=N \
    AttributeName=createdAt,AttributeType=S \
    AttributeName=pageId,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --global-secondary-indexes \
    '[
      {
        "IndexName": "PublishedPagesIndex",
        "KeySchema": [
          {"AttributeName": "isPublished", "KeyType": "HASH"},
          {"AttributeName": "createdAt", "KeyType": "RANGE"}
        ],
        "Projection": {"ProjectionType": "ALL"}
      },
      {
        "IndexName": "PageNodesIndex",
        "KeySchema": [
          {"AttributeName": "pageId", "KeyType": "HASH"},
          {"AttributeName": "createdAt", "KeyType": "RANGE"}
        ],
        "Projection": {"ProjectionType": "ALL"}
      }
    ]'
```

2. Required environment variables:
```
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
DYNAMODB_TABLE_NAME=PageManager
```

## Migration Steps

1. Install AWS SDK dependencies:
```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

2. Create a migration script to move data from localStorage to DynamoDB:
```typescript
async function migrateToDynamoDB() {
  const localData = JSON.parse(localStorage.getItem('pages') || '[]');
  const dynamoDb = new DynamoDBService();

  for (const page of localData) {
    await dynamoDb.createPage(page);
    for (const node of page.nodes) {
      await dynamoDb.createNode(node);
    }
  }
}
```

3. Update the application code to use DynamoDB instead of localStorage
4. Test thoroughly in a staging environment
5. Deploy the changes
6. Run the migration script
7. Verify data integrity

## Benefits of DynamoDB

1. **Scalability**: Handles large amounts of data and traffic
2. **Durability**: Automatic replication across multiple AZs
3. **Performance**: Single-digit millisecond latency
4. **Security**: IAM integration for access control
5. **Backup**: Point-in-time recovery and on-demand backups

## Considerations

1. **Costs**: Monitor DynamoDB usage and optimize if needed
2. **Latency**: Add loading states for async operations
3. **Error Handling**: Implement robust error handling for network requests
4. **Offline Support**: Consider implementing offline capabilities with IndexedDB
5. **Backup**: Implement regular backups of DynamoDB data