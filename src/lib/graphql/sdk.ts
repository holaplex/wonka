import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  timestamptz: any;
  uuid: any;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']>;
  _gt?: InputMaybe<Scalars['String']>;
  _gte?: InputMaybe<Scalars['String']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']>;
  _in?: InputMaybe<Array<Scalars['String']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']>;
  _lt?: InputMaybe<Scalars['String']>;
  _lte?: InputMaybe<Scalars['String']>;
  _neq?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']>;
  _nin?: InputMaybe<Array<Scalars['String']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']>;
};

/** columns and relationships of "creators" */
export type Creators = {
  __typename?: 'creators';
  aes_encrypted_keypair: Scalars['String'];
  created_at: Scalars['timestamptz'];
  id: Scalars['uuid'];
  name: Scalars['String'];
  updated_at: Scalars['timestamptz'];
};

/** aggregated selection of "creators" */
export type Creators_Aggregate = {
  __typename?: 'creators_aggregate';
  aggregate?: Maybe<Creators_Aggregate_Fields>;
  nodes: Array<Creators>;
};

/** aggregate fields of "creators" */
export type Creators_Aggregate_Fields = {
  __typename?: 'creators_aggregate_fields';
  count: Scalars['Int'];
  max?: Maybe<Creators_Max_Fields>;
  min?: Maybe<Creators_Min_Fields>;
};


/** aggregate fields of "creators" */
export type Creators_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Creators_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']>;
};

/** Boolean expression to filter rows from the table "creators". All fields are combined with a logical 'AND'. */
export type Creators_Bool_Exp = {
  _and?: InputMaybe<Array<Creators_Bool_Exp>>;
  _not?: InputMaybe<Creators_Bool_Exp>;
  _or?: InputMaybe<Array<Creators_Bool_Exp>>;
  aes_encrypted_keypair?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "creators" */
export enum Creators_Constraint {
  /** unique or primary key constraint on columns "name" */
  CreatorsNameKey = 'creators_name_key',
  /** unique or primary key constraint on columns "id" */
  CreatorsPkey = 'creators_pkey'
}

/** input type for inserting data into table "creators" */
export type Creators_Insert_Input = {
  aes_encrypted_keypair?: InputMaybe<Scalars['String']>;
  created_at?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['uuid']>;
  name?: InputMaybe<Scalars['String']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
};

/** aggregate max on columns */
export type Creators_Max_Fields = {
  __typename?: 'creators_max_fields';
  aes_encrypted_keypair?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** aggregate min on columns */
export type Creators_Min_Fields = {
  __typename?: 'creators_min_fields';
  aes_encrypted_keypair?: Maybe<Scalars['String']>;
  created_at?: Maybe<Scalars['timestamptz']>;
  id?: Maybe<Scalars['uuid']>;
  name?: Maybe<Scalars['String']>;
  updated_at?: Maybe<Scalars['timestamptz']>;
};

/** response of any mutation on the table "creators" */
export type Creators_Mutation_Response = {
  __typename?: 'creators_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int'];
  /** data from the rows affected by the mutation */
  returning: Array<Creators>;
};

/** on_conflict condition type for table "creators" */
export type Creators_On_Conflict = {
  constraint: Creators_Constraint;
  update_columns?: Array<Creators_Update_Column>;
  where?: InputMaybe<Creators_Bool_Exp>;
};

/** Ordering options when selecting data from "creators". */
export type Creators_Order_By = {
  aes_encrypted_keypair?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: creators */
export type Creators_Pk_Columns_Input = {
  id: Scalars['uuid'];
};

/** select columns of table "creators" */
export enum Creators_Select_Column {
  /** column name */
  AesEncryptedKeypair = 'aes_encrypted_keypair',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "creators" */
export type Creators_Set_Input = {
  aes_encrypted_keypair?: InputMaybe<Scalars['String']>;
  created_at?: InputMaybe<Scalars['timestamptz']>;
  id?: InputMaybe<Scalars['uuid']>;
  name?: InputMaybe<Scalars['String']>;
  updated_at?: InputMaybe<Scalars['timestamptz']>;
};

/** update columns of table "creators" */
export enum Creators_Update_Column {
  /** column name */
  AesEncryptedKeypair = 'aes_encrypted_keypair',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Creators_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Creators_Set_Input>;
  where: Creators_Bool_Exp;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "creators" */
  delete_creators?: Maybe<Creators_Mutation_Response>;
  /** delete single row from the table: "creators" */
  delete_creators_by_pk?: Maybe<Creators>;
  /** insert data into the table: "creators" */
  insert_creators?: Maybe<Creators_Mutation_Response>;
  /** insert a single row into the table: "creators" */
  insert_creators_one?: Maybe<Creators>;
  /** update data of the table: "creators" */
  update_creators?: Maybe<Creators_Mutation_Response>;
  /** update single row of the table: "creators" */
  update_creators_by_pk?: Maybe<Creators>;
  /** update multiples rows of table: "creators" */
  update_creators_many?: Maybe<Array<Maybe<Creators_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_CreatorsArgs = {
  where: Creators_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Creators_By_PkArgs = {
  id: Scalars['uuid'];
};


/** mutation root */
export type Mutation_RootInsert_CreatorsArgs = {
  objects: Array<Creators_Insert_Input>;
  on_conflict?: InputMaybe<Creators_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Creators_OneArgs = {
  object: Creators_Insert_Input;
  on_conflict?: InputMaybe<Creators_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_CreatorsArgs = {
  _set?: InputMaybe<Creators_Set_Input>;
  where: Creators_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Creators_By_PkArgs = {
  _set?: InputMaybe<Creators_Set_Input>;
  pk_columns: Creators_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Creators_ManyArgs = {
  updates: Array<Creators_Updates>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

export type Query_Root = {
  __typename?: 'query_root';
  /** fetch data from the table: "creators" */
  creators: Array<Creators>;
  /** fetch aggregated fields from the table: "creators" */
  creators_aggregate: Creators_Aggregate;
  /** fetch data from the table: "creators" using primary key columns */
  creators_by_pk?: Maybe<Creators>;
};


export type Query_RootCreatorsArgs = {
  distinct_on?: InputMaybe<Array<Creators_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Creators_Order_By>>;
  where?: InputMaybe<Creators_Bool_Exp>;
};


export type Query_RootCreators_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Creators_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Creators_Order_By>>;
  where?: InputMaybe<Creators_Bool_Exp>;
};


export type Query_RootCreators_By_PkArgs = {
  id: Scalars['uuid'];
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "creators" */
  creators: Array<Creators>;
  /** fetch aggregated fields from the table: "creators" */
  creators_aggregate: Creators_Aggregate;
  /** fetch data from the table: "creators" using primary key columns */
  creators_by_pk?: Maybe<Creators>;
};


export type Subscription_RootCreatorsArgs = {
  distinct_on?: InputMaybe<Array<Creators_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Creators_Order_By>>;
  where?: InputMaybe<Creators_Bool_Exp>;
};


export type Subscription_RootCreators_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Creators_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order_by?: InputMaybe<Array<Creators_Order_By>>;
  where?: InputMaybe<Creators_Bool_Exp>;
};


export type Subscription_RootCreators_By_PkArgs = {
  id: Scalars['uuid'];
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']>;
  _gt?: InputMaybe<Scalars['timestamptz']>;
  _gte?: InputMaybe<Scalars['timestamptz']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['timestamptz']>;
  _lte?: InputMaybe<Scalars['timestamptz']>;
  _neq?: InputMaybe<Scalars['timestamptz']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']>>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['uuid']>;
  _gt?: InputMaybe<Scalars['uuid']>;
  _gte?: InputMaybe<Scalars['uuid']>;
  _in?: InputMaybe<Array<Scalars['uuid']>>;
  _is_null?: InputMaybe<Scalars['Boolean']>;
  _lt?: InputMaybe<Scalars['uuid']>;
  _lte?: InputMaybe<Scalars['uuid']>;
  _neq?: InputMaybe<Scalars['uuid']>;
  _nin?: InputMaybe<Array<Scalars['uuid']>>;
};

export type AddCreatorMutationVariables = Exact<{
  creator: Creators_Insert_Input;
}>;


export type AddCreatorMutation = { __typename?: 'mutation_root', insert_creators_one?: { __typename?: 'creators', id: any, name: string, created_at: any, updated_at: any } | null };


export const AddCreatorDocument = gql`
    mutation addCreator($creator: creators_insert_input!) {
  insert_creators_one(object: $creator) {
    id
    name
    created_at
    updated_at
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    addCreator(variables: AddCreatorMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<AddCreatorMutation> {
      return withWrapper((wrappedRequestHeaders) => client.request<AddCreatorMutation>(AddCreatorDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'addCreator', 'mutation');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;