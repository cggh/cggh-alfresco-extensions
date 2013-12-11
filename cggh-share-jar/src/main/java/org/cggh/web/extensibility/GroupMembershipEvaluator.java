package org.cggh.web.extensibility;

import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.extensions.surf.RequestContext;
import org.springframework.extensions.surf.extensibility.ExtensionModuleEvaluator;

public class GroupMembershipEvaluator implements ExtensionModuleEvaluator {

    private static Log log = LogFactory.getLog(GroupMembershipEvaluator.class);

    // From SlingshotGroupComponentElementEvaluator
    public static final String GROUPS = "groups";
    public static final String RELATION = "relation";
    public static final String AND = "AND";
    public static final String NEGATE = "negate";

    protected EvaluatorUtil cgghUtil = null;

    /*
     * protected SlingshotEvaluatorUtil util = null;
     * 
     * public void setSlingshotEvaluatorUtil( SlingshotEvaluatorUtil
     * slingshotExtensibilityUtil) { this.util = slingshotExtensibilityUtil; }
     */
    public void setCgghEvaluatorUtil(EvaluatorUtil cgghUtil) {
	this.cgghUtil = cgghUtil;
    }

    /**
     * Checks to see whether or not the current user satisfies the group
     * membership requirements specified.
     */
    public boolean applyModule(RequestContext context,
			Map<String, String> evaluationProperties) {

		boolean memberOfAllGroups = getRelationship(context,
				evaluationProperties);
		List<String> groups = cgghUtil.getGroups(evaluationProperties.get(GROUPS));
		boolean isMember = cgghUtil.isMemberOfGroups(context, groups,
				memberOfAllGroups);
		boolean isSiteMember = cgghUtil.isMemberOfSites(context, groups,
				memberOfAllGroups);
		boolean negate = getNegation(context, evaluationProperties);
		boolean apply = ((isMember || isSiteMember) && !negate)
				|| (!(isMember || isSiteMember) && negate);

		log.debug("apply not:" + negate + " all:" + memberOfAllGroups + " groups:" +groups + " isMember:" + isMember + " isSiteMember:" + isSiteMember + " result:" + apply);
		return apply;
	}

    /**
     * Checks for a request for to negate the ruling. The default is false.
     * 
     * @param context
     * @param evaluationProperties
     * @return
     */
    protected boolean getNegation(RequestContext context, Map<String, String> evaluationProperties) {
	String negateParam = evaluationProperties.get(NEGATE);
	return (negateParam != null && negateParam.trim().equalsIgnoreCase(Boolean.TRUE.toString()));
    }

    /**
     * Gets the logical relationship between all the groups to test for
     * membership of. By default this boils down to a straight choice between
     * "AND" (must be a member of ALL groups) and "OR" (only needs to be a
     * member of one group)
     * 
     * @param context
     * @param evaluationProperties
     * @return
     */
    protected boolean getRelationship(RequestContext context, Map<String, String> evaluationProperties) {
	String relationParam = evaluationProperties.get(RELATION);
	return (relationParam != null && relationParam.trim().equalsIgnoreCase(AND));
    }

    public String[] getRequiredProperties() {
	String[] props = { GROUPS, RELATION, NEGATE };
	return props;
    }
}
