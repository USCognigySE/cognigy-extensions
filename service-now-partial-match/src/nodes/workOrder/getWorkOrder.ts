import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';
import { getSnowAuth, ISnowConnection } from "../../lib/snowAuth";


export interface IGetWorkOrderParams extends INodeFunctionBaseParams {
	config: {
		connection: ISnowConnection;
		workOrderNumber: string;
		getDisplayValues: boolean;
		assignedTo: string;
		state: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

export const getWorkOrderNode = createNodeDescriptor({
	type: "getWorkOrder",
	defaultLabel: "Get Work Order",
	summary: "Get a work order from Service Now",
	fields: [
		{
			key: "connection",
			label: "Service Now Connection",
			type: "connection",
			params: {
				connectionType: "snow",
				required: false
			}
		},
		{
			key: "workOrderNumber",
			label: "Work Order Number",
			description: "The number of the work order; e.g. WO4070568",
			type: "cognigyText",
			params: {
				required: false
			}
		},
		{
			key: "getDisplayValues",
			label: "Display Values",
			type: "checkbox",
			defaultValue: false
		},
		{
			key: "assignedTo",
			label: "Assigned To",
			description: "Filter by the user the work order is assigned to.",
			type: "cognigyText",
			defaultValue: ""
		},
		{
			key: "state",
			label: "State",
			description: "Filter by the work order state value.",
			type: "cognigyText",
			defaultValue: ""
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
			params: {
				options: [
					{
						label: "Input",
						value: "input"
					},
					{
						label: "Context",
						value: "context"
					}
				],
				required: true
			},
			defaultValue: "input"
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "snow.workOrder",
			condition: {
				key: "storeLocation",
				value: "input"
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "snow.workOrder",
			condition: {
				key: "storeLocation",
				value: "context"
			}
		}
	],
	sections: [
		{
			key: "storageOption",
			label: "Storage Option",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey",
			]
		},
		{
			key: "advanced",
			label: "Advanced",
			defaultCollapsed: true,
			fields: [
				"assignedTo",
				"state"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "workOrderNumber" },
		{ type: "field", key: "getDisplayValues" },
		{ type: "section", key: "advanced" },
		{ type: "section", key: "storageOption" }
	],
	tokens: [
		{
			label: "Work Order Number",
			script: "ci.snow.workOrder[0].number",
			type: "answer"
		},
		{
			label: "Work Order Short Description",
			script: "ci.snow.workOrder[0].short_description",
			type: "answer"
		},
		{
			label: "Work Order State",
			script: "ci.snow.workOrder[0].state",
			type: "answer"
		},
		{
			label: "Work Order Priority",
			script: "ci.snow.workOrder[0].priority",
			type: "answer"
		},
		{
			label: "Work Order Assigned To",
			script: "ci.snow.workOrder[0].assigned_to.value",
			type: "answer"
		},
		{
			label: "Work Order Assignment Group",
			script: "ci.snow.workOrder[0].assignment_group.value",
			type: "answer"
		},
		{
			label: "Work Order Work Start",
			script: "ci.snow.workOrder[0].work_start",
			type: "answer"
		},
		{
			label: "Work Order Work End",
			script: "ci.snow.workOrder[0].work_end",
			type: "answer"
		},
		{
			label: "Work Order Updated On",
			script: "ci.snow.workOrder[0].sys_updated_on",
			type: "answer"
		}
	],
	appearance: {
		color: "#80b6a1"
	},
	dependencies: {
		children: [
			"onSuccessGetWorkOrder",
			"onErrorGetWorkOrder"
		]
	},
	function: async ({ cognigy, config, childConfigs }: IGetWorkOrderParams) => {
		const { api } = cognigy;
		const { connection, storeLocation, inputKey, contextKey, workOrderNumber, assignedTo, state, getDisplayValues } = config;

		try {
			const { baseUrl, accessToken } = await getSnowAuth(connection);

			let query: string = "";

			// Use LIKE so partial work order numbers (e.g. "4070568") match the full record (e.g. WO4070568), matching the ServiceNow UI behavior.
			query = workOrderNumber ? `numberLIKE${workOrderNumber}` : "";
			query = state ? query + `^state=${state}` : query;
			query = assignedTo ? query + `^assigned_to=${assignedTo}` : query;
			query = getDisplayValues ? query + `&sysparm_display_value=${getDisplayValues}` : query;

			let url: string = `${baseUrl}/api/now/table/wm_order?sysparm_query=${query}`;

			const response = await axios.get(url, {
				headers: {
					'Accept': 'application/json',
					'Authorization': `Bearer ${accessToken}`
				}
			});

			const onSuccessChild = childConfigs.find(child => child.type === "onSuccessGetWorkOrder");
			api.setNextNode(onSuccessChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, response.data.result, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, response.data.result);
			}
		} catch (error) {

			const onErrorChild = childConfigs.find(child => child.type === "onErrorGetWorkOrder");
			api.setNextNode(onErrorChild.id);

			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: error.message }, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, { error: error.message });
			}
		}
	}
});

export const onSuccessGetWorkOrder = createNodeDescriptor({
	type: "onSuccessGetWorkOrder",
	parentType: "getWorkOrder",
	defaultLabel: "On Success",
	appearance: {
		color: "#61d188",
		textColor: "white",
		variant: "mini"
	}
});

export const onErrorGetWorkOrder = createNodeDescriptor({
	type: "onErrorGetWorkOrder",
	parentType: "getWorkOrder",
	defaultLabel: "On Error",
	appearance: {
		color: "#cf142b",
		textColor: "white",
		variant: "mini"
	}
});
